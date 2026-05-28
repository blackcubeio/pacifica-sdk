export type JsonValue = string | number | boolean | null | JsonValue[] | JsonObject;

export interface JsonObject {
  [key: string]: JsonValue;
}

export enum OperationType {
  CreateOrder = 'create_order',
  CreateMarketOrder = 'create_market_order',
  CancelOrder = 'cancel_order',
  CancelAllOrders = 'cancel_all_orders',
  EditOrder = 'edit_order',
  CreateStopOrder = 'create_stop_order',
  CancelStopOrder = 'cancel_stop_order',
  SetPositionTpsl = 'set_position_tpsl',
  UpdateLeverage = 'update_leverage',
  UpdateMarginMode = 'update_margin_mode',
  AddIsolatedMargin = 'add_isolated_margin',
  SetAutoLendDisabled = 'set_auto_lend_disabled',
  UpdateAccountSpotSettings = 'update_account_spot_settings',
  Withdraw = 'withdraw',
  WithdrawSpotAsset = 'withdraw_spot_asset',
  SubaccountInitiate = 'subaccount_initiate',
  SubaccountConfirm = 'subaccount_confirm',
  ListSubaccounts = 'list_subaccounts',
  TransferFunds = 'transfer_funds',
  SubaccountSpotTransfer = 'subaccount_spot_transfer',
  BindAgentWallet = 'bind_agent_wallet',
  ListAgentWallets = 'list_agent_wallets',
  RevokeAgentWallet = 'revoke_agent_wallet',
  RevokeAllAgentWallets = 'revoke_all_agent_wallets',
  ListAgentIpWhitelist = 'list_agent_ip_whitelist',
  AddAgentWhitelistedIp = 'add_agent_whitelisted_ip',
  RemoveAgentWhitelistedIp = 'remove_agent_whitelisted_ip',
  SetAgentIpWhitelistEnabled = 'set_agent_ip_whitelist_enabled',
  CreateApiKey = 'create_api_key',
  RevokeApiKey = 'revoke_api_key',
  ListApiKeys = 'list_api_keys',
  CreateLake = 'create_lake',
  DepositToLake = 'deposit_to_lake',
  WithdrawFromLake = 'withdraw_from_lake',
  ClaimLakeReferral = 'claim_lake_referral',
  ClaimLakeManager = 'claim_lake_manager',
  UpdateLakeDepositCap = 'update_lake_deposit_cap',
  AddLakeWhitelist = 'add_lake_whitelist',
  RemoveLakeWhitelist = 'remove_lake_whitelist',
  AddLakeBlacklist = 'add_lake_blacklist',
  RemoveLakeBlacklist = 'remove_lake_blacklist',
  AddLakeMaxLeverage = 'add_lake_max_leverage',
  RemoveLakeMaxLeverage = 'remove_lake_max_leverage',
}

export enum OrderSide {
  Bid = 'bid',
  Ask = 'ask',
}

export enum TimeInForce {
  Gtc = 'GTC',
  Ioc = 'IOC',
  Fok = 'FOK',
  Alo = 'ALO',
  Tob = 'TOB',
}

export enum TriggerPriceType {
  MarkPrice = 'mark_price',
  LastTradePrice = 'last_trade_price',
  MidPrice = 'mid_price',
}

export interface SignatureHeader {
  timestamp: number;
  expiryWindow: number;
  type: OperationType;
}

export interface HardwareSignature {
  type: 'hardware';
  value: string;
}

export interface Signer {
  secretKey: string;
  agentWallet?: string;
}

export type Signature = string | HardwareSignature;

export interface SignedRequestHeader {
  account: string;
  signature: Signature;
  timestamp: number;
  expiryWindow: number;
  agentWallet?: string;
}

export type SignedRequest<TPayload> = SignedRequestHeader & TPayload;

export interface SignedMessage<TSignature extends Signature = string> {
  message: string;
  signature: TSignature;
}
