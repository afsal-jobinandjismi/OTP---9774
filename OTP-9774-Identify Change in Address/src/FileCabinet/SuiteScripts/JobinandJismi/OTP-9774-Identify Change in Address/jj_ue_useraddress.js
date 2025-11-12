/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */

/************************************************************************************************ 
 *  
 * OTP-9774 : Identify change in Address
 * 
************************************************************************************************* 
 * 
 * Author: Jobin and Jismi IT Services 
 * 
 * Date Created : 29-October-2025 
 * 
 * Description : This User Event Script is designed to monitor changes in the address fields of a
 *               customer record. When an address is added or changed in the customer record in edit mode,
 *              the script updates a custom checkbox field to true, indicating that an address change has
 *              occurred. If no changes are detected, the checkbox is set to false.
 *
 * 
 * REVISION HISTORY
 *
 * @version 1.0 : 29-October-2025 :  The initial build was created by JJ0414
 * 
*************************************************************************************************/
define(['N/log','N/ui/serverWidget'], function (log, serverWidget) {

    /**
     * Defines the function definition that is executed before record is loaded.
     * The address changed field is set to disabled in the form.
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {string} scriptContext.type - Trigger type; use values from the scriptContext.UserEventType enum
     * @param {Form} scriptContext.form - The current form
     * @since 2015.2
     */



function beforeLoad(scriptContext) {
        try {
            if (scriptContext.type === scriptContext.UserEventType.EDIT ||
                scriptContext.type === scriptContext.UserEventType.CREATE ||
                scriptContext.type === scriptContext.UserEventType.VIEW) {

                let form = scriptContext.form;
                let field = form.getField({ id: 'custentity_jj_addresschanged' });
                if (field) {
                    field.updateDisplayType({
                        displayType: serverWidget.FieldDisplayType.DISABLED
                    });
                }
            }
        } catch (e) {
            log.error('Error in beforeLoad', e.message);
        }
    }
            /**
         * Defines the function definition that is executed before record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the scriptContext.UserEventType enum
         * @since 2015.2
         * 
         * Whenever a customer record is edited, this function checks for changes in the address fields.
         * If any address field has been added or modified, it sets the custom checkbox field to true.
         * If no changes are detected, it sets the checkbox to false.
         */


 
    function beforeSubmit(scriptContext) {
        try {
            if (!isEditscriptContext(scriptContext)) return;
 
            let newRecord = scriptContext.newRecord;
            let oldRecord = scriptContext.oldRecord;
 
            let addressChanged = hasAddressChanged(newRecord, oldRecord);
 
            updateCheckbox(newRecord, addressChanged);
 
        } catch (e) {
            log.error('Error in beforeSubmit', e.message);
        }
    }

/**
 * Validates if the script is running in EDIT context.
 *
 * @param {Object} scriptContext - The context object provided by NetSuite.
 * @returns {boolean} True if EDIT context, false otherwise.
 */
 
function isEditscriptContext(scriptContext) {
    try {
        if (scriptContext.type !== scriptContext.UserEventType.EDIT) {
            return false;
        }
        return true;
    } catch (e) {
        log.error('Error in isEditscriptContext', e.message);
        return false; 
    }
} 

/**
 * Checks if any address line has changed between new and old record.
 *
 * @param {Record} newRecord - The updated Customer record.
 * @param {Record} oldRecord - The previous Customer record.
 * @returns {boolean} True if address changed, false otherwise.
 */

    function hasAddressChanged(newRecord, oldRecord) {

        try{
        
        let newCount = newRecord.getLineCount({ sublistId: 'addressbook' });
        let oldCount = oldRecord.getLineCount({ sublistId: 'addressbook' });
 
 
        if (newCount !== oldCount) {
            return true;
        }
 
        for (let i = 0; i < newCount; i++) {
            let newSub = newRecord.getSublistSubrecord({
                sublistId: 'addressbook',
                fieldId: 'addressbookaddress',
                line: i
            });
 
            let oldSub = oldRecord.getSublistSubrecord({
                sublistId: 'addressbook',
                fieldId: 'addressbookaddress',
                line: i
            });
 
            if (!newSub || !oldSub) {
                return true;
            }
 
            if (isAddressLineChanged(newSub, oldSub, i)) {
                return true;
            }
        }
 
        return false;
    } catch (e) {
        log.error('Error in hasAddressChanged', e.message);
        return false; 
    }
    }

/**
 * Compares individual address fields between new and old subrecords.
 *
 * @param {Subrecord} newSub - The new address subrecord.
 * @param {Subrecord} oldSub - The old address subrecord.
 * @param {number} lineIndex - The line index being checked.
 * @returns {boolean} True if any field changed, false otherwise.
 */
 
    function isAddressLineChanged(newSub, oldSub, lineIndex) {

        try{
        let fields = ['attention', 'addressee', 'addr1', 'addr2', 'city', 'state', 'zip', 'country'];
 
        for (let j = 0; j < fields.length; j++) {
            let field = fields[j];
            let newVal = newSub.getValue({ fieldId: field }) || '';
            let oldVal = oldSub.getValue({ fieldId: field }) || '';
 
            if (newVal !== oldVal) {
                return true;
            }
        }
 
        return false;
    } catch (e) {
        log.error('Error in isAddressLineChanged', e.message);
        return false; 
    }
    }

/**
 * Updates the custom checkbox field on the Customer record.
 *
 * @param {Record} record - The Customer record being updated.
 * @param {boolean} isChanged - Whether the address has changed.
 */
 
    function updateCheckbox(record, isChanged) {

        try{
        record.setValue({
            fieldId: 'custentity_jj_addresschanged',
            value: isChanged
        });
 
    } catch (e) {
        log.error('Error in updateCheckbox', e.message);
        return false;
    }
    }
 
    return {
            beforeLoad: beforeLoad,
        beforeSubmit: beforeSubmit
    };
});
 
 
 
 
 
 