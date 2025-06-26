import { uniqueId } from "lodash";
import {
  IconFileDescription,
  IconAperture,
  IconSitemap,
  IconCreditCard,
} from "@tabler/icons-react";


interface MenuItem {
  id: string;
  title: string;
  icon: React.ElementType;
  href: string;
  chip?: string;
  chipColor?: string;
  allowedRoles?: string[];
  description?: string;
}

const Menuitems: MenuItem[] = [
  {
    id: uniqueId(),
    title: "Dashboard",
    icon: IconAperture,
    href: "/nlu/dashboards/customer",
    chipColor: "secondary",
    allowedRoles: ["Solution Architect", "Sales", "SDM", "Admin", "Tender Analyst", "Customer", "Root"],
    description: "Overview of all data",
  },
  {
    id: uniqueId(),
    title: "Payments",
    icon: IconCreditCard,
    href: "/nlu/payments",
    allowedRoles: ["Admin", "Customer", "Root"],
    description: "Manage and monitor payment transactions and billing settings"
  },
  {
    id: uniqueId(),
    title: "Launch Server",
    icon: IconFileDescription,
    href: "/nlu/customer/virtual-machines",
    allowedRoles: ["Admin", "Customer", "Root"],
    description: "Design your VM, configure specs and availability zones, and request a quote. Provisioning only begins after approval and contract confirmation.",
  },
];

export default Menuitems;