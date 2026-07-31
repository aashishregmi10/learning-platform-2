import { useMemo, useState } from "react";
import { Box, Chip, Tab, Tabs, Typography } from "@mui/material";

import BreadcrumbLayout from "../../../components/Shared/BreadcrumbLayout";
import DoubtThread from "../../../components/Student/DoubtThread";
import { StatCard, StatCardRow } from "../../../components/Shared/StatCard";
import { statusTokens, tokens } from "../../../theme";
import { useGetMyDoubtsQuery } from "../../../store/services/doubtApi";

// Every question across the subjects this teacher is assigned to, newest first.
const TeacherDoubtsScreen = () => {
  const { data, isLoading, error } = useGetMyDoubtsQuery();
  const [tab, setTab] = useState(0);

  const doubts = useMemo(() => data?.data ?? [], [data]);
  const open = useMemo(() => doubts.filter((d) => !d.isResolved), [doubts]);
  const resolved = useMemo(() => doubts.filter((d) => d.isResolved), [doubts]);
  const shown = tab === 0 ? open : tab === 1 ? resolved : doubts;

  const bySubject = useMemo(() => {
    const groups = new Map();
    shown.forEach((d) => {
      const key = d.subjectName || "Other";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(d);
    });
    return [...groups.entries()];
  }, [shown]);

  return (
    <BreadcrumbLayout breadcrumbs={[{ title: "Q&A" }]} isBusy={isLoading}>
      <BreadcrumbLayout.Error error={error} />

      <StatCardRow>
        <StatCard
          value={open.length}
          label="Awaiting an answer"
          tone={open.length > 0 ? "danger" : "success"}
        />
        <StatCard value={resolved.length} label="Resolved" tone="success" />
        <StatCard value={doubts.length} label="All questions" tone="info" />
        <StatCard value={bySubject.length} label="Subjects with activity" tone="warning" />
      </StatCardRow>

      <Box sx={{ mt: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label={`Open (${open.length})`} />
          <Tab label={`Resolved (${resolved.length})`} />
          <Tab label={`All (${doubts.length})`} />
        </Tabs>
      </Box>

      {bySubject.length === 0 ? (
        <BreadcrumbLayout.Paper sx={{ p: 4, borderRadius: 2.5, mt: 2 }}>
          <Typography variant="body2" sx={{ color: tokens.muted, textAlign: "center" }}>
            {tab === 0
              ? "Nothing waiting on you — every question has been answered."
              : "Nothing here yet."}
          </Typography>
        </BreadcrumbLayout.Paper>
      ) : (
        <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
          {bySubject.map(([subjectName, items]) => (
            <BreadcrumbLayout.Paper key={subjectName} sx={{ p: 2.5, borderRadius: 2.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <Typography variant="subtitle1">{subjectName}</Typography>
                <Chip
                  size="small"
                  label={items.length}
                  sx={{ bgcolor: statusTokens.neutral.bg, color: statusTokens.neutral.fg }}
                />
              </Box>
              <DoubtThread doubts={items} canResolve emptyText="No questions here." />
            </BreadcrumbLayout.Paper>
          ))}
        </Box>
      )}
    </BreadcrumbLayout>
  );
};

export default TeacherDoubtsScreen;
