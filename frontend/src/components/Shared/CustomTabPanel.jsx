export const CustomTabPanel = ({ activeTab, value, children }) => (
  <div role="tabpanel" hidden={value !== activeTab} id={`tabpanel-${value}`}>
    {activeTab === value && children}
  </div>
);

export default CustomTabPanel;
