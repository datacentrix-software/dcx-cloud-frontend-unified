import Cookies from "js-cookie";
import { IUser } from "@/types/IUser";

const getUserInitials = (user: IUser) => {
    if (!user) return '';
    return user.firstName[0] + user.lastName[0];
};

const getUserRoleDisplay = (user?: IUser | null): string | null => {
    const cookieRole = Cookies.get('roles');
    if (cookieRole) return cookieRole;

    if (user?.roles?.length) {
        return user.roles.map(({ role }) => role.name).join(', ');
    }

    return null;
};

const getOrganisationDisplay = (user?: IUser | null): string => {
    return user?.roles
        ?.map(({ organisation }) => organisation.organisation_name)
        .join(' | ') || '';
};

export { getUserInitials, getUserRoleDisplay, getOrganisationDisplay };
