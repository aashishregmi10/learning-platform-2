import { useSearchParams } from "react-router-dom";
import { Divider, Paper, Tab, Tabs } from "@mui/material";

// URL-driven tabs (?tab=value). Mirrors can-logistic's CustomTabs.
export const CustomTabs = ({ activeTab, tabs = [], children }) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const handleChange = (_, value) => {
    const merged = Object.fromEntries(searchParams);
    setSearchParams({ ...merged, tab: value });
  };

  return (
    <Paper elevation={0}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Tabs value={activeTab} onChange={handleChange} variant="scrollable" scrollButtons="auto">
          {tabs.map((t) => (
            <Tab key={t.value} label={t.label} value={t.value} />
          ))}
        </Tabs>
        {children}
      </div>
      <Divider />
    </Paper>
  );
};

export default CustomTabs;
