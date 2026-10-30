"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  ShieldCheck,
  Mail,
  Send,
  Trash2,
  Edit2,
  X,
  Search,
  CheckCircle,
  XCircle,
} from "lucide-react";
import "./staff.css";
import "../../adminall.css";
import { staffService } from "../../../../../services/admin/staffService";
import { roleService } from "../../../../../services/admin/roleService";
import { useStaffPermissions } from "../../../../../config/adminPermissions";
import { toast } from "@/components/CustomToast";
import ConfirmModal from "@/components/ConfirmModal";
import AdminTable from "@/components/AdminTable";

const AdminStaffPage = () => {
  const { can } = useStaffPermissions();
  const canManageStaff = can("staff:manage");
  const [loading, setLoading] = useState(true);
  const [staffList, setStaffList] = useState([]);
  const [roles, setRoles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  // Deactivate Modal state
  const [deactivateModal, setDeactivateModal] = useState({
    isOpen: false,
    staffId: null,
    staffName: "",
    isLoading: false,
  });

  // Invite Modal
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    fname: "",
    lname: "",
    email: "",
    phoneNumber: "",
    roleId: "",
  });

  // Edit Modal
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [editForm, setEditForm] = useState({
    fname: "",
    lname: "",
    phoneNumber: "",
    roleId: "",
    isActive: true,
  });

  // Action states
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Helper to restrict phone input to numbers (allows optional leading '+')
  const handlePhoneInput = (val, formType) => {
    let sanitized = val;
    if (val.startsWith("+")) {
      sanitized = "+" + val.slice(1).replace(/\D/g, "");
    } else {
      sanitized = val.replace(/\D/g, "");
    }

    if (formType === "invite") {
      setInviteForm((prev) => ({ ...prev, phoneNumber: sanitized }));
    } else {
      setEditForm((prev) => ({ ...prev, phoneNumber: sanitized }));
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [staffRes, rolesRes] = await Promise.allSettled([
        staffService.getAllStaff(),
        roleService.getAllRoles(),
      ]);

      if (staffRes.status === "fulfilled") {
        const rawStaff =
          staffRes.value?.data?.staff ||
          staffRes.value?.staff ||
          staffRes.value?.data ||
          [];
        setStaffList(Array.isArray(rawStaff) ? rawStaff : []);
      } else {
        console.error("Failed to load staff list:", staffRes.reason);
        toast.error("Failed to load staff members.");
      }

      if (rolesRes.status === "fulfilled") {
        const rawRoles =
          rolesRes.value?.data?.roles ||
          rolesRes.value?.roles ||
          rolesRes.value?.data ||
          [];
        setRoles(Array.isArray(rawRoles) ? rawRoles : []);
      }
    } catch (err) {
      console.error("Error fetching staff data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    if (!inviteForm.fname || !inviteForm.lname || !inviteForm.email || !inviteForm.roleId) {
      toast.error("Please fill in first name, last name, email, and select a role.");
      return;
    }

    try {
      setInviteLoading(true);
      const payload = {
        fname: inviteForm.fname.trim(),
        lname: inviteForm.lname.trim(),
        email: inviteForm.email.trim(),
        phoneNumber: inviteForm.phoneNumber.trim(),
        roleId: inviteForm.roleId,
      };

      await staffService.createStaff(payload);
      toast.success("Staff invite sent successfully!");
      setIsInviteOpen(false);
      setInviteForm({
        fname: "",
        lname: "",
        email: "",
        phoneNumber: "",
        roleId: roles[0]?._id || "",
      });
      fetchData();
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to invite staff member.";
      toast.error(msg);
    } finally {
      setInviteLoading(false);
    }
  };

  const openEditModal = (staff) => {
    setSelectedStaff(staff);
    let firstName = staff.fname || "";
    let lastName = staff.lname || "";
    if (!firstName && staff.name) {
      const parts = staff.name.split(" ");
      firstName = parts[0] || "";
      lastName = parts.slice(1).join(" ") || "";
    }

    const currentRoleId =
      staff.roleId ||
      staff.role?._id ||
      (typeof staff.role === "string" ? staff.role : "");

    setEditForm({
      fname: firstName,
      lname: lastName,
      phoneNumber: staff.phoneNumber || staff.phone || "",
      roleId: currentRoleId,
      isActive: staff.isActive ?? true,
    });
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStaff?._id) return;

    try {
      setEditLoading(true);
      const payload = {
        fname: editForm.fname.trim(),
        lname: editForm.lname.trim(),
        phoneNumber: editForm.phoneNumber.trim(),
        roleId: editForm.roleId,
        isActive: editForm.isActive,
      };

      await staffService.updateStaff(selectedStaff._id, payload);
      toast.success("Staff member updated successfully!");
      setIsEditOpen(false);
      setSelectedStaff(null);
      fetchData();
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to update staff member.";
      toast.error(msg);
    } finally {
      setEditLoading(false);
    }
  };

  const handleResendInvite = async (staffId) => {
    try {
      setActionLoadingId(staffId);
      await staffService.resendInvite(staffId);
      toast.success("Invite email resent!");
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to resend invite.";
      toast.error(msg);
    } finally {
      setActionLoadingId(null);
    }
  };

  const promptDeactivate = (staffId, staffName) => {
    setDeactivateModal({
      isOpen: true,
      staffId,
      staffName,
      isLoading: false,
    });
  };

  const handleConfirmDeactivate = async () => {
    const { staffId } = deactivateModal;
    if (!staffId) return;

    try {
      setDeactivateModal((prev) => ({ ...prev, isLoading: true }));
      await staffService.deleteStaff(staffId);
      toast.success("Staff member deactivated.");
      setDeactivateModal({ isOpen: false, staffId: null, staffName: "", isLoading: false });
      fetchData();
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to deactivate staff member.";
      toast.error(msg);
      setDeactivateModal((prev) => ({ ...prev, isLoading: false }));
    }
  };

  // Filtered staff
  const filteredStaff = staffList.filter((member) => {
    const fullName = `${member.fname || ""} ${member.lname || ""} ${member.name || ""}`.toLowerCase();
    const email = (member.email || "").toLowerCase();
    const phone = (member.phoneNumber || member.phone || "").toLowerCase();
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      fullName.includes(search) || email.includes(search) || phone.includes(search);

    const memberRoleId = member.roleId || member.role?._id || member.role?.name || member.role;
    const matchesRole = roleFilter === "all" || memberRoleId === roleFilter;

    return matchesSearch && matchesRole;
  });

  const totalStaff = staffList.length;
  const activeStaff = staffList.filter((s) => s.isActive !== false).length;
  const pendingInvites = staffList.filter((s) => s.inviteAccepted === false || !s.isActive).length;

  if (loading) {
    return (
      <div className="resolve-wrap">
        <p>Loading staff members...</p>
        <div className="respinner"></div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard staff-container">
      {/* Header */}
      <div className="staff-header-actions">
        <div className="dashboard-header">
          <h1>Staff Management</h1>
          <p>Manage internal staff accounts, invitations, and permissions.</p>
        </div>
        {canManageStaff && (
          <button
            className="staff-btn-primary"
            onClick={() => {
              if (roles.length > 0 && !inviteForm.roleId) {
                setInviteForm((prev) => ({ ...prev, roleId: roles[0]._id || roles[0].id || "" }));
              }
              setIsInviteOpen(true);
            }}
          >
            <UserPlus size={16} /> Add Staff Member
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="dashboard-cards">
        <div className="stat-card">
          <div>
            <span>Total Staff</span>
            <h3>{totalStaff}</h3>
          </div>
          <Users size={24} />
        </div>
        <div className="stat-card">
          <div>
            <span>Active Staff</span>
            <h3>{activeStaff}</h3>
          </div>
          <CheckCircle size={24} />
        </div>
        <div className="stat-card">
          <div>
            <span>Roles Available</span>
            <h3>{roles.length}</h3>
          </div>
          <ShieldCheck size={24} />
        </div>
        <div className="stat-card">
          <div>
            <span>Pending / Inactive</span>
            <h3>{pendingInvites}</h3>
          </div>
          <Mail size={24} />
        </div>
      </div>

      {/* Responsive Staff Table */}
      <AdminTable
        title={`Staff Members (${staffList.length})`}
        subtitle="Internal team members, active administrative roles, and invitation states"
        data={staffList}
        columns={[
          {
            header: "Staff Member",
            accessor: "fname",
            sortable: true,
            render: (staff) => {
              const displayName =
                staff.fname || staff.lname
                  ? `${staff.fname || ""} ${staff.lname || ""}`.trim()
                  : staff.name || "Staff Member";
              return <span style={{ fontWeight: 600, color: "#0f172a" }}>{displayName}</span>;
            },
          },
          {
            header: "Email",
            accessor: "email",
            sortable: true,
            render: (staff) => <span style={{ color: "#475569" }}>{staff.email}</span>,
          },
          {
            header: "Phone Number",
            accessor: "phoneNumber",
            render: (staff) => staff.phoneNumber || staff.phone || "—",
          },
          {
            header: "Role",
            accessor: "role.name",
            sortable: true,
            render: (staff) => {
              const roleName =
                staff.role?.name || (typeof staff.role === "string" ? staff.role : "staff");
              return <span className="badge-role">{roleName}</span>;
            },
          },
          {
            header: "Status",
            accessor: "isActive",
            sortable: true,
            render: (staff) => {
              const isActive = staff.isActive ?? true;
              return (
                <span
                  className={`badge-status ${
                    staff.inviteAccepted === false
                      ? "invited"
                      : isActive
                      ? "active"
                      : "inactive"
                  }`}
                >
                  {staff.inviteAccepted === false
                    ? "Invited"
                    : isActive
                    ? "Active"
                    : "Deactivated"}
                </span>
              );
            },
          },
          {
            header: "Created At",
            accessor: "createdAt",
            sortable: true,
            render: (staff) => (
              <span style={{ color: "#64748b", fontSize: "13px" }}>
                {staff.createdAt ? new Date(staff.createdAt).toLocaleDateString() : "—"}
              </span>
            ),
          },
          {
            header: "Actions",
            align: "center",
            render: (staff) => {
              if (!canManageStaff) {
                return <span style={{ fontSize: "12px", color: "#9ca3af" }}>View Only</span>;
              }
              const displayName =
                staff.fname || staff.lname
                  ? `${staff.fname || ""} ${staff.lname || ""}`.trim()
                  : staff.name || "Staff Member";
              const isActive = staff.isActive ?? true;

              return (
                <div className="table-actions">
                  {staff.inviteAccepted === false && (
                    <button
                      className="staff-btn-secondary"
                      onClick={() => handleResendInvite(staff._id)}
                      disabled={actionLoadingId === staff._id}
                      title="Resend Invitation Email"
                    >
                      <Send size={12} /> Invite
                    </button>
                  )}

                  <button
                    className="staff-btn-secondary"
                    onClick={() => openEditModal(staff)}
                    title="Edit Staff Member"
                  >
                    <Edit2 size={12} /> Edit
                  </button>

                  {isActive && (
                    <button
                      className="staff-btn-danger"
                      onClick={() => promptDeactivate(staff._id, displayName)}
                      title="Deactivate Account"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              );
            },
          },
        ]}
        filters={[
          {
            key: "roleId",
            label: "All Roles",
            filterFn: (member, val) => {
              const memberRoleId = member.roleId || member.role?._id || member.role?.name || member.role;
              return memberRoleId === val;
            },
            options: roles.map((r) => ({
              value: r._id || r.id || r.name,
              label: r.name,
            })),
          },
          {
            key: "status",
            label: "All Status",
            filterFn: (member, val) => {
              if (val === "invited") return member.inviteAccepted === false;
              if (val === "active") return member.isActive !== false && member.inviteAccepted !== false;
              if (val === "inactive") return member.isActive === false;
              return true;
            },
            options: [
              { value: "active", label: "Active" },
              { value: "invited", label: "Invited" },
              { value: "inactive", label: "Deactivated" },
            ],
          },
        ]}
        searchPlaceholder="Search by name, email, phone..."
        initialPageSize={10}
        emptyMessage="No staff members found matching your search."
      />

      {/* Invite Modal */}
      {isInviteOpen && (
        <div className="staff-modal-backdrop" onClick={() => setIsInviteOpen(false)}>
          <div className="staff-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="staff-modal-header">
              <h3>Add Staff Member & Send Invite</h3>
              <button
                className="staff-modal-close"
                onClick={() => setIsInviteOpen(false)}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleInviteSubmit}>
              <div className="staff-modal-body">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div className="staff-form-group">
                    <label>First Name (fname) *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ada"
                      value={inviteForm.fname}
                      onChange={(e) =>
                        setInviteForm({ ...inviteForm, fname: e.target.value })
                      }
                    />
                  </div>
                  <div className="staff-form-group">
                    <label>Last Name (lname) *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Obi"
                      value={inviteForm.lname}
                      onChange={(e) =>
                        setInviteForm({ ...inviteForm, lname: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="staff-form-group">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="ada@tecnurx.com"
                    value={inviteForm.email}
                    onChange={(e) =>
                      setInviteForm({ ...inviteForm, email: e.target.value })
                    }
                  />
                </div>

                <div className="staff-form-group">
                  <label>Phone Number (Digits only)</label>
                  <input
                    type="tel"
                    inputMode="tel"
                    placeholder="e.g. +2348012345678 or 08012345678"
                    value={inviteForm.phoneNumber}
                    onChange={(e) => handlePhoneInput(e.target.value, "invite")}
                  />
                </div>

                <div className="staff-form-group">
                  <label>Assigned Role (roleId) *</label>
                  <select
                    required
                    value={inviteForm.roleId}
                    onChange={(e) =>
                      setInviteForm({ ...inviteForm, roleId: e.target.value })
                    }
                  >
                    <option value="" disabled>Select a role</option>
                    {roles.map((r) => (
                      <option key={r._id || r.id} value={r._id || r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="staff-modal-footer">
                <button
                  type="button"
                  className="staff-btn-secondary"
                  onClick={() => setIsInviteOpen(false)}
                  disabled={inviteLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="staff-btn-primary"
                  disabled={inviteLoading}
                >
                  {inviteLoading ? "Sending Invite..." : "Send Invite"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Staff Modal */}
      {isEditOpen && selectedStaff && (
        <div className="staff-modal-backdrop" onClick={() => setIsEditOpen(false)}>
          <div className="staff-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="staff-modal-header">
              <h3>Edit Staff Member</h3>
              <button
                className="staff-modal-close"
                onClick={() => setIsEditOpen(false)}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="staff-modal-body">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div className="staff-form-group">
                    <label>First Name</label>
                    <input
                      type="text"
                      required
                      value={editForm.fname}
                      onChange={(e) =>
                        setEditForm({ ...editForm, fname: e.target.value })
                      }
                    />
                  </div>
                  <div className="staff-form-group">
                    <label>Last Name</label>
                    <input
                      type="text"
                      required
                      value={editForm.lname}
                      onChange={(e) =>
                        setEditForm({ ...editForm, lname: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="staff-form-group">
                  <label>Phone Number (Digits only)</label>
                  <input
                    type="tel"
                    inputMode="tel"
                    placeholder="e.g. +2348012345678 or 08012345678"
                    value={editForm.phoneNumber}
                    onChange={(e) => handlePhoneInput(e.target.value, "edit")}
                  />
                </div>

                <div className="staff-form-group">
                  <label>Assigned Role (roleId)</label>
                  <select
                    value={editForm.roleId}
                    onChange={(e) =>
                      setEditForm({ ...editForm, roleId: e.target.value })
                    }
                  >
                    <option value="">Select a role</option>
                    {roles.map((r) => (
                      <option key={r._id || r.id} value={r._id || r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Interactive Status Switch Card */}
                <div className="staff-form-group">
                  <label>Account Status</label>
                  <div
                    className={`status-toggle-card ${editForm.isActive ? "active" : "inactive"}`}
                    onClick={() =>
                      setEditForm((prev) => ({ ...prev, isActive: !prev.isActive }))
                    }
                    role="button"
                    tabIndex={0}
                  >
                    <div className="status-toggle-info">
                      <div className="status-toggle-title">
                        {editForm.isActive ? (
                          <>
                            <CheckCircle size={16} color="#16a34a" />
                            <span style={{ color: "#166534" }}>Active Account</span>
                          </>
                        ) : (
                          <>
                            <XCircle size={16} color="#dc2626" />
                            <span style={{ color: "#991b1b" }}>Deactivated Account</span>
                          </>
                        )}
                      </div>
                      <span className="status-toggle-desc">
                        {editForm.isActive
                          ? "Staff member can sign in and perform authorized actions"
                          : "Account is suspended; staff member login is blocked"}
                      </span>
                    </div>

                    <div className={`switch-track ${editForm.isActive ? "checked" : ""}`}>
                      <div className="switch-thumb" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="staff-modal-footer">
                <button
                  type="button"
                  className="staff-btn-secondary"
                  onClick={() => setIsEditOpen(false)}
                  disabled={editLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="staff-btn-primary"
                  disabled={editLoading}
                >
                  {editLoading ? "Saving Changes..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Deactivate Confirmation Modal */}
      <ConfirmModal
        isOpen={deactivateModal.isOpen}
        title="Deactivate Staff Member"
        message={`Are you sure you want to deactivate ${deactivateModal.staffName || "this staff member"}? They will immediately lose access to the admin dashboard.`}
        confirmText="Deactivate"
        cancelText="Cancel"
        type="danger"
        isLoading={deactivateModal.isLoading}
        onConfirm={handleConfirmDeactivate}
        onCancel={() =>
          setDeactivateModal({ isOpen: false, staffId: null, staffName: "", isLoading: false })
        }
      />
    </div>
  );
};

export default AdminStaffPage;
