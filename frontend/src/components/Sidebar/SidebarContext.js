import { createContext, useContext } from "react";

/**
 * Whether the nav rail is showing icons only.
 *
 * A context rather than a prop because the role sidebars (Admin/Teacher/
 * Student) sit between the layout and SidebarMenu and have no reason to know
 * or forward this.
 */
export const SidebarContext = createContext({ collapsed: false });

export const useSidebarCollapsed = () => useContext(SidebarContext).collapsed;

export default SidebarContext;
