/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/log'], function (log) {
 
    function beforeSubmit(context) {
        try {
            if (!isEditContext(context)) return;
 
            var newRecord = context.newRecord;
            var oldRecord = context.oldRecord;
 
            var addressChanged = hasAddressChanged(newRecord, oldRecord);
 
            updateCheckbox(newRecord, addressChanged);
 
        } catch (e) {
            log.error('Error in beforeSubmit', e.message);
        }
    }
 
    function isEditContext(context) {
        if (context.type !== context.UserEventType.EDIT) {
            log.debug('Skipped', 'Not an EDIT operation');
            return false;
        }
        return true;
    }
 
    function hasAddressChanged(newRecord, oldRecord) {
        var newCount = newRecord.getLineCount({ sublistId: 'addressbook' });
        var oldCount = oldRecord.getLineCount({ sublistId: 'addressbook' });
 
        log.debug('Line Count', 'New: ' + newCount + ', Old: ' + oldCount);
 
        if (newCount !== oldCount) {
            log.debug('Change Detected', 'Address line count changed');
            return true;
        }
 
        for (var i = 0; i < newCount; i++) {
            var newSub = newRecord.getSublistSubrecord({
                sublistId: 'addressbook',
                fieldId: 'addressbookaddress',
                line: i
            });
 
            var oldSub = oldRecord.getSublistSubrecord({
                sublistId: 'addressbook',
                fieldId: 'addressbookaddress',
                line: i
            });
 
            if (!newSub || !oldSub) {
                log.debug('Change Detected', 'Missing subrecord at line ' + i);
                return true;
            }
 
            if (isAddressLineChanged(newSub, oldSub, i)) {
                return true;
            }
        }
 
        return false;
    }
 
    function isAddressLineChanged(newSub, oldSub, lineIndex) {
        var fields = ['attention', 'addressee', 'addr1', 'addr2', 'city', 'state', 'zip', 'country'];
 
        for (var j = 0; j < fields.length; j++) {
            var field = fields[j];
            var newVal = newSub.getValue({ fieldId: field }) || '';
            var oldVal = oldSub.getValue({ fieldId: field }) || '';
 
            if (newVal !== oldVal) {
                log.debug('Field Changed', 'Line ' + lineIndex + ', Field: ' + field + ', Old: ' + oldVal + ', New: ' + newVal);
                return true;
            }
        }
 
        return false;
    }
 
    function updateCheckbox(record, isChanged) {
        record.setValue({
            fieldId: 'custentityjj_addrbox',
            value: isChanged
        });
 
        log.debug('Checkbox Updated',  + isChanged);
    }
 
    return {
        beforeSubmit: beforeSubmit
    };
});
 
 
 