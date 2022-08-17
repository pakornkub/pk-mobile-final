import ReceiveSP from "../views/ReceiveSP";
import UnlockSP from "../views/UnlockSP";
import ReceiveReturn from "../views/ReceiveReturn";
import JobRepack from "../views/JobRepack";
import JobRecheck from "../views/JobRecheck";
import ShipToWH from "../views/ShipToWH";
import WHReceive from "../views/WHReceive";
import Withdraw from "../views/Withdraw";
import CheckStock from "../views/CheckStock";
import CountStock from "../views/CountStock";

export const DynamicMenu: any = {
  ReceiveSPMobile: ReceiveSP,
  UnlockSPMobile: UnlockSP,
  ReceiveReturnMobile: ReceiveReturn,
  JobRepackMobile: JobRepack,
  JobRecheckMobile: JobRecheck,
  ShipToWHMobile: ShipToWH,
  WHReceiveMobile: WHReceive,
  WithdrawMobile: Withdraw,
  CheckStockMobile: CheckStock,
  CountStockMobile: CountStock,
};

// Note : set menu name to dynamic menu
