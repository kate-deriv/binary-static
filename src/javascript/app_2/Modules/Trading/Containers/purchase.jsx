import PropTypes         from 'prop-types';
import React             from 'react';
import { localize }      from '_common/localize';
import { isEmptyObject } from '_common/utility';
import { PopConfirm }    from 'App/Components/Elements/PopConfirm';
import Fieldset          from 'App/Components/Form/fieldset.jsx';
import { connect }       from 'Stores/connect';
import ContractInfo      from '../Components/Form/Purchase/contract-info.jsx';
import MessageBox        from '../Components/Form/Purchase/MessageBox';
import PurchaseLock      from '../Components/Form/Purchase/PurchaseLock';
import PurchaseButton    from '../Components/Elements/purchase-button.jsx';

const Purchase = ({
    contract_type,
    currency,
    is_contract_mode,
    is_client_allowed_to_visit,
    is_purchase_confirm_on,
    is_purchase_enabled,
    is_purchase_locked,
    is_trade_enabled,
    onClickPurchase,
    onHoverPurchase,
    resetPurchase,
    togglePurchaseLock,
    purchase_info,
    proposal_info,
    trade_types,
}) => (
    Object.keys(trade_types).map((type, idx) => {
        const info        = proposal_info[type] || {};
        const is_disabled = is_contract_mode
            || !is_purchase_enabled
            || !is_trade_enabled
            || !info.id
            || !is_client_allowed_to_visit;
        const is_high_low = /high_low/.test(contract_type.toLowerCase());
        const is_loading  = !info.has_error && !info.id;
        const purchase_button = (
            <PurchaseButton
                currency={currency}
                info={info}
                is_disabled={is_disabled}
                is_high_low={is_high_low}
                is_loading={is_loading}
                onClickPurchase={onClickPurchase}
                trade_types={trade_types}
                type={type}
            />
        );
        const is_purchase_error = (!isEmptyObject(purchase_info) && purchase_info.echo_req.buy === info.id);

        return (
            <Fieldset
                className='trade-container__fieldset purchase-container__option'
                key={idx}
                onMouseEnter={() => { onHoverPurchase(true, type); }}
                onMouseLeave={() => { onHoverPurchase(false); }}
            >
                {is_purchase_error &&
                <MessageBox
                    purchase_info={purchase_info}
                    onClick={resetPurchase}
                    currency={currency}
                />
                }
                {(is_purchase_locked && idx === 0) &&
                <PurchaseLock onClick={togglePurchaseLock} />
                }
                <React.Fragment>
                    <ContractInfo
                        currency={currency}
                        proposal_info={info}
                        has_increased={info.has_increased}
                        is_visible={!is_contract_mode}
                    />
                    <div className='btn-purchase__shadow-wrapper'>
                        {
                            is_purchase_confirm_on ?
                                <PopConfirm
                                    alignment='left'
                                    cancel_text={localize('Cancel')}
                                    confirm_text={localize('Purchase')}
                                    message={localize('Are you sure you want to purchase this contract?')}
                                >
                                    {purchase_button}
                                </PopConfirm>
                                :
                                purchase_button
                        }
                    </div>
                </React.Fragment>
            </Fieldset>
        );
    })
);

Purchase.propTypes = {
    currency                  : PropTypes.string,
    is_client_allowed_to_visit: PropTypes.bool,
    is_contract_mode          : PropTypes.bool,
    is_purchase_confirm_on    : PropTypes.bool,
    is_purchase_enabled       : PropTypes.bool,
    is_purchase_locked        : PropTypes.bool,
    is_trade_enabled          : PropTypes.bool,
    onClickPurchase           : PropTypes.func,
    onHoverPurchase           : PropTypes.func,
    proposal_info             : PropTypes.object,
    purchase_info             : PropTypes.object,
    resetPurchase             : PropTypes.func,
    togglePurchaseLock        : PropTypes.func,
    trade_types               : PropTypes.object,
};

export default connect(
    ({ client, modules, ui }) => ({
        currency                  : client.currency,
        is_client_allowed_to_visit: client.is_client_allowed_to_visit,
        is_contract_mode          : modules.smart_chart.is_contract_mode,
        contract_type             : modules.trade.contract_type,
        is_purchase_enabled       : modules.trade.is_purchase_enabled,
        is_trade_enabled          : modules.trade.is_trade_enabled,
        onClickPurchase           : modules.trade.onPurchase,
        onHoverPurchase           : modules.trade.onHoverPurchase,
        resetPurchase             : modules.trade.requestProposal,
        proposal_info             : modules.trade.proposal_info,
        purchase_info             : modules.trade.purchase_info,
        trade_types               : modules.trade.trade_types,
        is_purchase_confirm_on    : ui.is_purchase_confirm_on,
        is_purchase_locked        : ui.is_purchase_lock_on,
        togglePurchaseLock        : ui.togglePurchaseLock,
    }),
)(Purchase);
