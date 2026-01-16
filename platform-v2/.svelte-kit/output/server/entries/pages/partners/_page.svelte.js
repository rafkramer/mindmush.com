import { e as ensure_array_like, c as store_get, d as attr_class, u as unsubscribe_stores } from "../../../chunks/index2.js";
import { a as auth } from "../../../chunks/auth.js";
import { v as ventures } from "../../../chunks/ventures.js";
import { t as toast } from "../../../chunks/toast.js";
import { B as Button } from "../../../chunks/Button.js";
import { P as Plus, M as Modal, S as Select } from "../../../chunks/Select.js";
import { I as Input } from "../../../chunks/Input.js";
import { B as Badge } from "../../../chunks/Badge.js";
import { S as Square_pen } from "../../../chunks/square-pen.js";
import { _ as escape_html } from "../../../chunks/context.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let showAddModal = false;
    let showEditModal = false;
    let editingUser = null;
    let newPartner = { username: "", password: "", role: "partner", contract: "" };
    let editForm = { password: "", role: "partner", contract: "" };
    const roleOptions = [
      { value: "partner", label: "Partner" },
      { value: "admin", label: "Admin" }
    ];
    function getUserVentures(userId) {
      return store_get($$store_subs ??= {}, "$ventures", ventures).filter((v) => v.partners.some((p) => p.userId === userId)).map((v) => {
        const partner = v.partners.find((p) => p.userId === userId);
        return { name: v.name, equity: partner?.equity || 0 };
      });
    }
    function addPartner() {
      if (!newPartner.username.trim() || !newPartner.password) {
        toast.show("Please fill in all required fields", "error");
        return;
      }
      const exists = store_get($$store_subs ??= {}, "$auth", auth).users.some((u) => u.username === newPartner.username.trim());
      if (exists) {
        toast.show("Username already exists", "error");
        return;
      }
      auth.addUser({
        username: newPartner.username.trim(),
        password: newPartner.password,
        role: newPartner.role,
        contract: newPartner.contract
      });
      toast.show("Partner added successfully", "success");
      showAddModal = false;
      newPartner = { username: "", password: "", role: "partner", contract: "" };
    }
    function openEditModal(user) {
      editingUser = user;
      editForm = { password: "", role: user.role, contract: user.contract || "" };
      showEditModal = true;
    }
    function savePartner() {
      if (!editingUser) return;
      const updates = { role: editForm.role, contract: editForm.contract };
      if (editForm.password) {
        updates.password = editForm.password;
      }
      auth.updateUser(editingUser.id, updates);
      toast.show("Partner updated successfully", "success");
      showEditModal = false;
      editingUser = null;
    }
    function deletePartner() {
      if (!editingUser) return;
      if (editingUser.username === "admin") {
        toast.show("Cannot delete admin account", "error");
        return;
      }
      if (!confirm("Are you sure you want to delete this partner?")) return;
      store_get($$store_subs ??= {}, "$ventures", ventures).forEach((v) => {
        const filtered = v.partners.filter((p) => p.userId !== editingUser?.id);
        if (filtered.length !== v.partners.length) {
          ventures.updatePartners(v.id, filtered);
        }
      });
      auth.deleteUser(editingUser.id);
      toast.show("Partner deleted", "success");
      showEditModal = false;
      editingUser = null;
    }
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      $$renderer3.push(`<div class="animate-fade-in"><div class="flex justify-between items-start mb-7"><div><h1 class="text-2xl font-semibold tracking-tight">Partners</h1> <p class="text-sm text-white/45 mt-1">Manage team access</p></div> `);
      Button($$renderer3, {
        onclick: () => showAddModal = true,
        children: ($$renderer4) => {
          Plus($$renderer4, { size: 16 });
          $$renderer4.push(`<!----> Add Partner`);
        }
      });
      $$renderer3.push(`<!----></div> <div class="space-y-3"><!--[-->`);
      const each_array = ensure_array_like(store_get($$store_subs ??= {}, "$auth", auth).users);
      for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
        let user = each_array[$$index_1];
        const userVentures = getUserVentures(user.id);
        $$renderer3.push(`<div class="flex items-center gap-5 p-5 bg-white/[0.025] border border-white/[0.05] rounded-2xl hover:border-white/[0.08] transition-all"><div${attr_class("w-12 h-12 rounded-xl flex items-center justify-center text-lg font-semibold text-white shrink-0", void 0, {
          "bg-gradient-to-br": true,
          "from-indigo-500": user.role === "admin",
          "to-purple-500": user.role === "admin",
          "from-green-500": user.role === "partner",
          "to-emerald-500": user.role === "partner"
        })}>${escape_html(user.username.charAt(0).toUpperCase())}</div> <div class="flex-1 min-w-0"><div class="flex items-center gap-2.5 mb-1"><span class="font-medium text-white">${escape_html(user.username)}</span> `);
        Badge($$renderer3, {
          variant: user.role === "admin" ? "purple" : "green",
          children: ($$renderer4) => {
            $$renderer4.push(`<!---->${escape_html(user.role)}`);
          }
        });
        $$renderer3.push(`<!----></div> `);
        if (userVentures.length > 0) {
          $$renderer3.push("<!--[-->");
          $$renderer3.push(`<div class="flex flex-wrap gap-1.5"><!--[-->`);
          const each_array_1 = ensure_array_like(userVentures);
          for (let $$index = 0, $$length2 = each_array_1.length; $$index < $$length2; $$index++) {
            let v = each_array_1[$$index];
            $$renderer3.push(`<span class="inline-flex items-center gap-1 px-2.5 py-1 bg-white/[0.035] rounded-full text-[11px] text-white/75">${escape_html(v.name)} <span class="text-indigo-400 font-semibold">${escape_html(v.equity)}%</span></span>`);
          }
          $$renderer3.push(`<!--]--></div>`);
        } else {
          $$renderer3.push("<!--[!-->");
          $$renderer3.push(`<p class="text-xs text-white/45">No ventures assigned</p>`);
        }
        $$renderer3.push(`<!--]--></div> `);
        Button($$renderer3, {
          variant: "secondary",
          size: "sm",
          onclick: () => openEditModal(user),
          children: ($$renderer4) => {
            Square_pen($$renderer4, { size: 14 });
            $$renderer4.push(`<!----> Edit`);
          }
        });
        $$renderer3.push(`<!----></div>`);
      }
      $$renderer3.push(`<!--]--></div></div> `);
      Modal($$renderer3, {
        title: "Add New Partner",
        onclose: () => showAddModal = false,
        get open() {
          return showAddModal;
        },
        set open($$value) {
          showAddModal = $$value;
          $$settled = false;
        },
        children: ($$renderer4) => {
          $$renderer4.push(`<div class="p-6 space-y-5">`);
          Input($$renderer4, {
            id: "username",
            label: "Username",
            placeholder: "Enter username",
            get value() {
              return newPartner.username;
            },
            set value($$value) {
              newPartner.username = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          Input($$renderer4, {
            id: "password",
            type: "password",
            label: "Password",
            placeholder: "Enter password",
            get value() {
              return newPartner.password;
            },
            set value($$value) {
              newPartner.password = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> `);
          Select($$renderer4, {
            id: "role",
            label: "Role",
            options: roleOptions,
            get value() {
              return newPartner.role;
            },
            set value($$value) {
              newPartner.role = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> <div class="space-y-2"><label for="newContract" class="block text-[11px] font-semibold text-white/45 uppercase tracking-wider">Contract Notes (optional)</label> <textarea id="newContract" class="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm min-h-[100px] resize-y placeholder:text-white/45 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/25 focus:outline-none" placeholder="Enter contract terms...">`);
          const $$body = escape_html(newPartner.contract);
          if ($$body) {
            $$renderer4.push(`${$$body}`);
          }
          $$renderer4.push(`</textarea></div></div> <div class="flex justify-end gap-3 px-6 py-5 border-t border-white/[0.05] bg-black/20">`);
          Button($$renderer4, {
            variant: "ghost",
            onclick: () => showAddModal = false,
            children: ($$renderer5) => {
              $$renderer5.push(`<!---->Cancel`);
            }
          });
          $$renderer4.push(`<!----> `);
          Button($$renderer4, {
            onclick: addPartner,
            children: ($$renderer5) => {
              $$renderer5.push(`<!---->Add Partner`);
            }
          });
          $$renderer4.push(`<!----></div>`);
        },
        $$slots: { default: true }
      });
      $$renderer3.push(`<!----> `);
      Modal($$renderer3, {
        title: "Edit Partner",
        onclose: () => showEditModal = false,
        get open() {
          return showEditModal;
        },
        set open($$value) {
          showEditModal = $$value;
          $$settled = false;
        },
        children: ($$renderer4) => {
          if (editingUser) {
            $$renderer4.push("<!--[-->");
            $$renderer4.push(`<div class="p-6 space-y-5">`);
            Input($$renderer4, {
              id: "editUsername",
              label: "Username",
              value: editingUser.username,
              readonly: true
            });
            $$renderer4.push(`<!----> `);
            Input($$renderer4, {
              id: "editPassword",
              type: "password",
              label: "New Password (leave blank to keep)",
              placeholder: "Enter new password",
              get value() {
                return editForm.password;
              },
              set value($$value) {
                editForm.password = $$value;
                $$settled = false;
              }
            });
            $$renderer4.push(`<!----> `);
            Select($$renderer4, {
              id: "editRole",
              label: "Role",
              options: roleOptions,
              get value() {
                return editForm.role;
              },
              set value($$value) {
                editForm.role = $$value;
                $$settled = false;
              }
            });
            $$renderer4.push(`<!----> <div class="space-y-2"><label for="editContract" class="block text-[11px] font-semibold text-white/45 uppercase tracking-wider">Contract Notes</label> <textarea id="editContract" class="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm min-h-[100px] resize-y placeholder:text-white/45 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/25 focus:outline-none" placeholder="Enter contract terms...">`);
            const $$body_1 = escape_html(editForm.contract);
            if ($$body_1) {
              $$renderer4.push(`${$$body_1}`);
            }
            $$renderer4.push(`</textarea></div></div> <div class="flex justify-between px-6 py-5 border-t border-white/[0.05] bg-black/20">`);
            Button($$renderer4, {
              variant: "danger",
              onclick: deletePartner,
              children: ($$renderer5) => {
                $$renderer5.push(`<!---->Delete`);
              }
            });
            $$renderer4.push(`<!----> <div class="flex gap-3">`);
            Button($$renderer4, {
              variant: "ghost",
              onclick: () => showEditModal = false,
              children: ($$renderer5) => {
                $$renderer5.push(`<!---->Cancel`);
              }
            });
            $$renderer4.push(`<!----> `);
            Button($$renderer4, {
              onclick: savePartner,
              children: ($$renderer5) => {
                $$renderer5.push(`<!---->Save`);
              }
            });
            $$renderer4.push(`<!----></div></div>`);
          } else {
            $$renderer4.push("<!--[!-->");
          }
          $$renderer4.push(`<!--]-->`);
        },
        $$slots: { default: true }
      });
      $$renderer3.push(`<!---->`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _page as default
};
