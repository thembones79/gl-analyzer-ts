export type TData = {
  ska1GlCode: string;
  skatGlDescription: string;
  ska1GlGroup: string;
  yh010Group: string;
  yh010GroupDescription: string;
  inScope: boolean;
  bc00: string[];
  bc00Level: string;
  accountCategory: string;
  accountGroupDescription: string;
  accountItem: string;
  accountItemName: string;
  abdulSuffix1: string;
  oneSided: boolean;
  abdulSuffix3: string;
  twoSidedSource: string;
  lineItemDisplay: boolean;
  keyAccount: boolean;
  riskLevel: string;
  frequency: string;
  dueDate: string;
  reconciliationLevel: string;
  currencySplit: boolean;
  reconType: string;
  templateName: string;
  t880: boolean;
  preparerRecon: string;
  approverRecon: string;
  reviewerRecon: string;
  ska1HouseBank: string;
  ska1DelFi: string;
  ska1PostingBlock: string;
  skb1MarkedForDeletion: string;
  skb1AccountCurrency: string;
  skb1HouseBank: string;
  skb1OpenItemManagementByLedgerGroup: string;
  skb1ReconciliationAccount: string;
  skb1LocalCurrencyOnly: string;
  skb1GlAccount2: string;
  skb1PostAutomatically: string;
  skb1PostingBlock: string;
  skb1AlternativeAccount: string;
  skb1LineItemDisplay: string;
  skb1GlAccount: string;
  skb1OpenItemManagement: string;
  accountItemClearing: string;
  accountItemNameClearing: string;
  clearingSuffix1: string;
  clearingSuffix2: string;
  clearingSuffix3: string;
  inScopeClearing: boolean;
  preparerClearing: string;
  approverClearing: string;
  reviewerClearing: string;
  accountItemClearing_RevC: string;
  accountItemNameClearing_RevC: string;
  clearingSuffix1_RevC: string;
  clearingSuffix2_RevC: string;
  clearingSuffix3_RevC: string;
  inScopeClearing_RevC: boolean;
  preparerClearing_RevC: string;
  approverClearing_RevC: string;
  reviewerClearing_RevC: string;
  gL_PC_PPC_TP_DC_Assig_RevC: string;
  gL_PC_PPC_TP_DC_ABSDC_ABSLC: string;
  gL_PC_DC_ABSDC_ABSLC_RevC: string;
  gL_PC_PPC_TP_DC_ABSLC: string;
  gL_PC_PPC_TP_DC_ABSLC_RevC: string;
  gL_PC_PPC_TP_DC_Ref_Cust: string;
  gL_PC_PPC_TP_DC_SDoc_SOI: string;
  gL_PC_PPC_TP_DC_ABSDC_ABSLC_ABSLC2: string;
  gL_PC_PPC_TP_DC_SDoc_SOI_RevC: string;
  gL_PC_PPC_TP_DC_PCBlocked: string;
  gL_PC_PPC_TP_DC_ABSLC_ABSLC2_Ref_Vend_RevC: string;
  gL_PC_PPC_TP_DC_Ref_Vend_RevC: string;
  gL_PC_PPC_TP_DC_ABSDC_ABSLC_RevC: string;
  gL_PC_PPC_TP_DC_Assig: string;
  gL_PC_PPC_TP_DC_ABSLC_ABSLC2_Vend_RevC: string;
  gL_PC_PPC_TP_DC_Ref: string;
  gL_PC_PPC_TP_DC_ABSLC_ABSLC2_Ref: string;
  gL_PC_PPC_TP_DC_PCBlocked_RevC: string;
  gL_PC_PPC_TP_DC_HTxt_RevC: string;
  gL_PC_PPC_TP_DC_ABSLC_ABSLC2_Ref_Cust: string;
  gL_PC_PPC_TP_DC_ABSLC_ABSLC2_Vend: string;
  gL_PC_PPC_TP_DC_Ref_RevC: string;
  gL_PC_PPC_TP_DC_ABSDC: string;
  gL_PC_PPC_TP_DC_ABSLC_ABSLC2_HTxt: string;
  gL_PC_PPC_TP_DC_ABSLC_ABSLC2_Assig: string;
  gL_PC_PPC_TP_DC_ABSLC_ABSLC2_LTxt: string;
  gL_PC_PPC_TP_DC_LTxt: string;
  gL_PC_PPC_TP_DC_ABSLC_SDoc_SOI_RevC: string;
  gL_PC_PPC_TP_DC_Reversals: string;
  gL_PC_PPC_TP_DC_Reversals_RevC: string;
  gL_PC_PPC_TP_DC_ABSLC_ABSLC2_Ref_Vend: string;
  gL_PC_PPC_TP_DC_ABSDC_ABSLC_ABSLC2_RevC: string;
  gL_PC_PPC_TP_DC_ABSLC_ABSLC2_Assig_RevC: string;
  gL_PC_PPC_TP_DC_ABSLC_ABSLC2_Cust: string;
  gL_PC_PPC_TP_DC_HTxt: string;
  gL_PC_PPC_TP_DC: string;
  gL_PC_PPC_TP_DC_LTxt_RevC: string;
  gl_DC_ABSDC_RevC: string;
  gL_PC_PPC_TP_DC_Ref_Vend: string;
  gL_PC_DC_ABSDC_ABSLC: string;
  gL_DC_ABSDC: string;
  gL_PC_PPC_TP_DC_ABSLC_ABSLC2_HTxt_RevC: string;
  gL_PC_PPC_TP_DC_RevC: string;
  gL_PC_DC_ABSDC: string;
  gL_PC_PPC_TP_DC_ABSLC_ABSLC2_LTxt_RevC: string;
  gL_PC_PPC_TP_DC_ABSLC_SDoc_SOI: string;
  gL_PC_PPC_TP_DC_ABSDC_RevC: string;
  gL_PC_PPC_TP_DC_ABSLC_ABSLC2_Ref_RevC: string;
  gL_PC_DC_ABSDC_RevC: string;
  gL_PC_PPC_TP_DC_ABSLC_ABSLC2_Cust_RevC: string;
  gL_PC_PPC_TP_DC_ABSLC_ABSLC2_Ref_Cust_RevC: string;
  gL_PC_PPC_TP_DC_Ref_Cust_RevC: string;
}[];

export type TChanges = Record<any, any>;

export type TPerms = {
  user: string;
  timestamp: number;
};

export type TStore = {
  data?: TData;
  changes?: TChanges;
  perm?: TPerms;
};

export type TStoreMethods = Record<
  keyof TStore,
  {
    get: () => TStore[keyof TStore];
    set: (v: TStore[keyof TStore]) => void;
  }
>;

export const store: TStore = {
  data: undefined,
  changes: undefined,
  perm: undefined,
};
