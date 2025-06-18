import { uniqueId } from "lodash";

interface MenuitemsType {
  [x: string]: any;
  id?: string;
  navlabel?: boolean;
  subheader?: string;
  title?: string;
  icon?: any;
  href?: string;
  children?: MenuitemsType[];
  chip?: string;
  chipColor?: string;
  variant?: string;
  external?: boolean;
}
import {
  IconAperture,
  IconCurrencyDollar,
  IconBox,
} from "@tabler/icons-react";

const Menuitems: MenuitemsType[] = [
  {
    id: uniqueId(),
    title: "Dashboard",
    icon: IconAperture,
    href: "/customer/dashboard",
  },
  {
    id: uniqueId(),
    title: "Payments",
    icon: IconCurrencyDollar,
    href: "/customer/payments",
  },
  {
    id: uniqueId(),
    title: "Launch Server",
    icon: IconBox,
    href: "/customer/launch-server",
  },
];

export default Menuitems;
