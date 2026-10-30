"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  ShieldPlus,
  Key,
  Edit2,
  Trash2,
  X,
  Lock,
  Sparkles,
} from "lucide-react";
import "./roles.css";
import "../staff/staff.css";
import "../../adminall.css";
import { roleService } from "../../../../../services/admin/roleService";
import { useStaffPermissions } from "../../../../../config/adminPermissions";
import { toast } from "@/components/CustomToast";
import ConfirmModal from "@/components/ConfirmModal";

const AdminRolesPage = () => {
  const { can } = useStaffPermissions();
  const canManageRoles = can("roles:manage");

  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState([]);
  const [availablePermissions, setAvailablePermissions] = useState([]);

  // Create / Edit modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    permissions: [],
  });

  // Delete Confirm Modal State
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    role: null,
    isLoading: false,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [rolesRes, permRes] = await Promise.allSettled([
        roleService.getAllRoles(),
        roleService.getPermissions(),
      ]);

      if (rolesRes.status === "fulfilled") {
        const rawRoles =
          rolesRes.value?.data?.roles ||
          rolesRes.value?.roles ||
          rolesRes.value?.data ||
          [];
        setRoles(Array.isArray(rawRoles) ? rawRoles : []);
      } else {
        console.error("Failed to load roles:", rolesRes.reason);
        toast.error("Failed to load roles.");
      }

      if (permRes.status === "fulfilled") {
        const rawPerms =
          permRes.value?.data?.permissions ||
          permRes.value?.permissions ||
          permRes.value?.data ||
          [];
        const permList = Array.isArray(rawPerms)
          ? rawPerms.filter((p) => {
              const k = typeof p === "string" ? p : p?.key || p?.name;
              return k && k !== "*";
            })
          : [];
        setAvailablePermissions(permList);
      } else {
        // Fallback with all standard permissions (excluding wildcard *)
        setAvailablePermissions([
          "staff:manage",
          "roles:manage",
          "repairs:read",
          "repairs:assign",
          "repairs:manage",
          "payments:read",
          "payments:manage",
          "engineers:manage",
          "engineers:verify",
          "users:read",
          "users:manage",
          "logistics:read",
          "logistics:manage",
          "catalog:manage",
          "catalog:read",
          "services:read",
          "services:manage",
        ]);
      }
    } catch (err) {
      console.error("Error fetching roles data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setEditingRole(null);
    setFormData({
      name: "",
      description: "",
      permissions: [],
    });
    setIsModalOpen(true);
  };

  const openEditModal = (role) => {
    setEditingRole(role);
    setFormData({
      name: role.name || "",
      description: role.description || "",
      permissions: Array.isArray(role.permissions)
        ? role.permissions
            .map((p) => (typeof p === "string" ? p : p.key || p.name))
            .filter((p) => p && p !== "*")
        : [],
    });
    setIsModalOpen(true);
  };

  const handleTogglePermission = (perm) => {
    setFormData((prev) => {
      const exists = prev.permissions.includes(perm);
      if (exists) {
        return {
          ...prev,
          permissions: prev.permissions.filter((p) => p !== perm),
        };
      } else {
        return {
          ...prev,
          permissions: [...prev.permissions, perm],
        };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Role name is required.");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        permissions: formData.permissions,
      };

      if (editingRole) {
        await roleService.updateRole(editingRole._id, payload);
        toast.success("Role updated successfully!");
      } else {
        await roleService.createRole(payload);
        toast.success("Role created successfully!");
      }

      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to save role.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const promptDelete = (role) => {
    if (role.name?.toLowerCase() === "super_admin" || role.name?.toLowerCase() === "admin") {
      toast.error("System roles cannot be deleted.");
      return;
    }
    setDeleteModal({
      isOpen: true,
      role,
      isLoading: false,
    });
  };

  const handleConfirmDelete = async () => {
    const role = deleteModal.role;
    if (!role?._id) return;

    try {
      setDeleteModal((prev) => ({ ...prev, isLoading: true }));
      await roleService.deleteRole(role._id);
      toast.success("Role deleted successfully!");
      setDeleteModal({ isOpen: false, role: null, isLoading: false });
      fetchData();
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to delete role.";
      toast.error(msg);
      setDeleteModal((prev) => ({ ...prev, isLoading: false }));
    }
  };

  if (loading) {
    return (
      <div className="resolve-wrap">
        <p>Loading roles and permissions...</p>
        <div className="respinner"></div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard roles-container">
      {/* Header */}
      <div className="staff-header-actions">
        <div className="dashboard-header">
          <h1>Roles & Permissions</h1>
          <p>Define custom roles and assign granular system permissions.</p>
        </div>
        {canManageRoles && (
          <button className="staff-btn-primary" onClick={openCreateModal}>
            <ShieldPlus size={16} /> Create Role
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="dashboard-cards">
        <div className="stat-card">
          <div>
            <span>Total Roles</span>
            <h3>{roles.length}</h3>
          </div>
          <ShieldCheck size={24} />
        </div>
        <div className="stat-card">
          <div>
            <span>Total Permissions</span>
            <h3>{availablePermissions.length}</h3>
          </div>
          <Key size={24} />
        </div>
      </div>

      {/* Roles Grid */}
      <div className="roles-grid">
        {roles.map((role) => {
          const isSystemRole =
            role.name?.toLowerCase() === "super_admin" ||
            role.name?.toLowerCase() === "admin";
          const permList = Array.isArray(role.permissions) ? role.permissions : [];

          return (
            <div key={role._id || role.name} className="role-card">
              <div>
                <div className="role-card-header">
                  <div className="role-card-title">
                    {isSystemRole ? <Lock size={15} color="#d97706" /> : <ShieldCheck size={15} color="#2563eb" />}
                    {role.name}
                  </div>
                  <span className="role-staff-count">
                    {role.staffCount ?? 0} staff
                  </span>
                </div>

                <div className="role-description">
                  {role.description || "No description provided."}
                </div>

                <div className="role-permissions-section">
                  <h5>Assigned Permissions ({permList.length})</h5>
                  <div className="permission-tags-wrap">
                    {permList.length === 0 ? (
                      <span style={{ fontSize: "12px", color: "#9ca3af" }}>
                        No permissions assigned
                      </span>
                    ) : (
                      permList.map((p, idx) => {
                        const label = typeof p === "string" ? p : p.name || p.key || JSON.stringify(p);
                        const isWildcard = label === "*";

                        return (
                          <span
                            key={idx}
                            className="permission-tag"
                            style={
                              isWildcard
                                ? { background: "#fef3c7", color: "#92400e", borderColor: "#fde68a", fontWeight: "700" }
                                : {}
                            }
                          >
                            {isWildcard ? "* (All Permissions)" : label}
                          </span>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              <div className="role-card-actions">
                {canManageRoles ? (
                  <>
                    <button
                      className="staff-btn-secondary"
                      onClick={() => openEditModal(role)}
                    >
                      <Edit2 size={12} /> Edit
                    </button>

                    {!isSystemRole && (
                      <button
                        className="staff-btn-danger"
                        onClick={() => promptDelete(role)}
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                    )}
                  </>
                ) : (
                  <span style={{ fontSize: "12px", color: "#9ca3af" }}>View Only</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="staff-modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div
            className="staff-modal-box"
            style={{ maxWidth: "600px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="staff-modal-header">
              <h3>{editingRole ? `Edit Role: ${editingRole.name}` : "Create New Role"}</h3>
              <button
                className="staff-modal-close"
                onClick={() => setIsModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="staff-modal-body">
                <div className="staff-form-group">
                  <label>Role Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Operations Manager"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>

                <div className="staff-form-group">
                  <label>Description</label>
                  <textarea
                    rows={2}
                    placeholder="Describe what staff with this role are responsible for..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>

                <div className="staff-form-group">
                  <label>
                    Permissions ({formData.permissions.length} selected)
                  </label>
                  <div className="permissions-selection-grid">
                    {availablePermissions
                      .filter((perm) => {
                        const key =
                          typeof perm === "string" ? perm : perm?.key || perm?.name;
                        return key && key !== "*";
                      })
                      .map((perm) => {
                        const permKey =
                          typeof perm === "string" ? perm : perm.key || perm.name;
                        const isChecked = formData.permissions.includes(permKey);

                        return (
                          <label
                            key={permKey}
                            className="permission-checkbox-label"
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleTogglePermission(permKey)}
                            />
                            <span>{permKey}</span>
                          </label>
                        );
                      })}
                  </div>
                </div>
              </div>

              <div className="staff-modal-footer">
                <button
                  type="button"
                  className="staff-btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="staff-btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? "Saving..."
                    : editingRole
                    ? "Update Role"
                    : "Create Role"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title="Delete Role"
        message={`Are you sure you want to delete role "${deleteModal.role?.name}"? Staff assigned to this role will lose their custom permissions.`}
        confirmText="Delete Role"
        cancelText="Cancel"
        type="danger"
        isLoading={deleteModal.isLoading}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModal({ isOpen: false, role: null, isLoading: false })}
      />
    </div>
  );
};

export default AdminRolesPage;
