import { escapeHtml } from "./formatters.js";

export function qs(selector, parent = document) {
  return parent.querySelector(selector);
}

export function qsa(selector, parent = document) {
  return [...parent.querySelectorAll(selector)];
}

export function formToObject(form) {
  const formData = new FormData(form);
  return Object.fromEntries(formData.entries());
}

export function clearFormErrors(form) {
  qsa(".is-invalid", form).forEach((element) => element.classList.remove("is-invalid"));
  qsa("[data-error-for]", form).forEach((element) => {
    element.textContent = "";
  });
}

export function applyFormErrors(form, errors) {
  Object.entries(errors).forEach(([name, message]) => {
    const field = form.elements[name];
    const errorNode = qs(`[data-error-for="${name}"]`, form);

    if (field) {
      field.classList.add("is-invalid");
    }

    if (errorNode) {
      errorNode.textContent = message;
    }
  });
}

export function setBusyState(button, isBusy, busyText = "Saving...") {
  if (!button) {
    return;
  }

  if (!button.dataset.originalText) {
    button.dataset.originalText = button.innerHTML;
  }

  button.disabled = isBusy;
  button.innerHTML = isBusy
    ? `<span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>${escapeHtml(busyText)}`
    : button.dataset.originalText;
}

export function renderInlineAlert(container, message, type = "danger") {
  if (!container) {
    return;
  }

  container.innerHTML = message
    ? `<div class="alert alert-${type} mb-0" role="alert">${escapeHtml(message)}</div>`
    : "";
}
