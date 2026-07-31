import StatusBadge from "./StatusBadge";
import { roleForFlag } from "../../utils/statusRole";

/**
 * Boolean-flag badge: published/active vs draft/off. Thin wrapper over
 * StatusBadge so the isActive / isPublished pattern stays a one-liner.
 *
 * `offRole` defaults to warning ("draft" needs someone to publish it); pass
 * "neutral" where the off state is simply a setting rather than unfinished work.
 */
export const StatusChip = ({
  active,
  labels = ["Published", "Draft"],
  offRole = "warning",
  size = "small",
}) => (
  <StatusBadge
    role={roleForFlag(active, { offRole })}
    label={active ? labels[0] : labels[1]}
    size={size}
  />
);

export default StatusChip;
