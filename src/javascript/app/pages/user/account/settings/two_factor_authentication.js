const QRCode           = require('davidshimjs-qrcodejs');
const BinarySocket     = require('../../../../base/socket');
const Client           = require('../../../../base/client');
const FormManager      = require('../../../../common/form_manager');
const getPropertyValue = require('../../../../../_common/utility').getPropertyValue;
const localize         = require('../../../../../_common/localize').localize;
// TODO:
// 1. Error handling
// 2. ui
// 3. tooltip to form?

const TwoFactorAuthentication = (() => {
    let enabled_state,
        next_state,
        qrcode; // eslint-disable-line 

    const onLoad = () => {
        init();
    };

    const init = () => {
        BinarySocket.send({ account_security: 1, totp_action: 'status'}).then((res) => {
            $('#two_factor_loading').remove();

            if (res.error) {
                handleError('status', res.error.message);
                return;
            }

            enabled_state = res.account_security.totp.is_enabled ? 'enabled' : 'disabled';
            next_state = res.account_security.totp.is_enabled ? 'disable' : 'enable';
            const form_id = '#frm_two_factor_auth';

            $(`#${enabled_state}`).setVisibility(1);
            $('#btn_submit').text(next_state);
            $(form_id).setVisibility(1);

            FormManager.init(form_id, [
                { selector: '#otp', validations: ['req'], request_field: 'otp' },
                { request_field: 'account_security', value: 1 },
                { request_field: 'totp_action', value: next_state },
            ]);
            FormManager.handleSubmit({
                form_selector       : form_id,
                fnc_response_handler: handleSubmit,
                enable_button       : true,
            });

            if (enabled_state === 'disabled') {
                initQRCode();
            }
        });
    };

    const resetComponent = () => {
        $(`#${enabled_state}`).setVisibility(0);
        $('#qrcode').html('');
        init();
    };

    const initQRCode = () => {
        BinarySocket.send({ account_security: 1, totp_action: 'generate'}).then((res) => {
            $('#qrcode_loading').setVisibility(0);

            if (res.error) {
                handleError('generate', res.error.message);
                return;
            }

            makeQrCode(res.account_security.totp.secret_key);
        });
    };

    const makeQrCode = (key) => {
        const otpAuth = `otpauth://totp/${Client.get('email')}?secret=${key}&issuer=Binary.com`;
        qrcode = new QRCode(document.getElementById('qrcode'), {
            text  : otpAuth,
            width : 130,
            height: 130,
        });
    };

    const handleSubmit = (res) => {
        if ('error' in res) {
            showFormMessage(getPropertyValue(res, ['error', 'message']) || 'Sorry, an error occurred.');
        } else {
            $('#otp').val('');
            showFormMessage(`You have successfully ${next_state}d two-factor authentication for your account`, true);
        }
    };

    const handleError = (id, err_msg = 'Sorry, an error occurred.') => {
        $(`#${id}_error`).setVisibility(1).text(localize(err_msg));
    };

    const showFormMessage = (msg, is_success) => {
        $('#form_message')
            .attr('class', is_success ? 'success-msg' : 'error-msg')
            .html(is_success ? $('<ul/>', { class: 'checked' }).append($('<li/>', { text: localize(msg) })) : localize(msg))
            .css('display', 'block')
            .delay(5000)
            .fadeOut(1000, is_success? resetComponent: '');
    };

    return {
        onLoad,
    };
})();

module.exports = TwoFactorAuthentication;
