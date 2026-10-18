// Offline regression tests; no browser, dependencies, network or form submission.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'css/style.css'), 'utf8');
const script = fs.readFileSync(path.join(root, 'js/main.js'), 'utf8');

function element() {
    const classes = new Set();
    return {
        listeners: {}, attributes: {}, style: {}, focused: false,
        classList: {
            add: name => classes.add(name),
            remove: name => classes.delete(name),
            contains: name => classes.has(name),
            toggle(name, force) {
                const enabled = force === undefined ? !classes.has(name) : force;
                if (enabled) classes.add(name); else classes.delete(name);
                return enabled;
            }
        },
        setAttribute(name, value) { this.attributes[name] = String(value); },
        getAttribute(name) { return this.attributes[name]; },
        addEventListener(name, callback) { (this.listeners[name] ||= []).push(callback); },
        emit(name, event = {}) {
            (this.listeners[name] || []).forEach(callback => callback.call(this, event));
        },
        focus() { this.focused = true; }
    };
}

function setup() {
    const toggle = element(), menu = element(), body = element(), link = element();
    const navbar = element(), document = element(), window = element();
    toggle.setAttribute('aria-expanded', 'false');
    document.body = body;
    document.querySelector = selector => ({
        '.nav-toggle': toggle, '.nav-menu': menu, '.navbar': navbar
    })[selector] || null;
    document.querySelectorAll = selector => selector === '.nav-menu a' ? [link] : [];
    document.getElementById = () => null; // Never exercise the booking form.
    window.innerWidth = 375;
    vm.runInNewContext(script, {
        document, window, HTMLImageElement: { prototype: {} },
        console: { log() {} }, Date
    });
    document.emit('DOMContentLoaded');
    return { toggle, menu, body, link, document, window };
}

function assertOpen(ui, open) {
    assert.equal(ui.menu.classList.contains('active'), open);
    assert.equal(ui.toggle.classList.contains('active'), open);
    assert.equal(ui.body.classList.contains('nav-open'), open);
    assert.equal(ui.toggle.getAttribute('aria-expanded'), String(open));
}

test('menu toggle identifies its controlled menu and initial closed state', () => {
    const button = html.match(/<button\b[^>]*class="nav-toggle"[^>]*>/)[0];
    assert.match(button, /aria-expanded="false"/);
    const id = button.match(/aria-controls="([^"]+)"/)?.[1];
    assert.ok(id);
    assert.match(html, new RegExp('<ul[^>]*id="' + id + '"[^>]*class="nav-menu"'));
});

test('active mobile menu has a visible, scrollable layout below desktop breakpoint', () => {
    const mobile = css.match(/@media\s*\(max-width:\s*767\.98px\)\s*\{\s*\.nav-menu\.active\s*\{([^}]+)\}/);
    assert.ok(mobile, 'missing mobile active-menu rule');
    assert.match(mobile[1], /display:\s*flex/);
    assert.match(mobile[1], /flex-direction:\s*column/);
    assert.match(mobile[1], /overflow-y:\s*auto/);
    assert.match(mobile[1], /max-height:/);
    assert.match(css, /@media\s*\(min-width:\s*768px\)/);
});

test('repeated toggle clicks synchronize visual and accessible state', () => {
    const ui = setup();
    assertOpen(ui, false);
    for (const open of [true, false, true, false]) {
        ui.toggle.emit('click');
        assertOpen(ui, open);
    }
});

test('following a menu link closes the menu and allows reopening', () => {
    const ui = setup();
    ui.toggle.emit('click');
    ui.link.emit('click');
    assertOpen(ui, false);
    ui.toggle.emit('click');
    assertOpen(ui, true);
});

test('Escape closes an open menu and restores focus, but does not steal focus when closed', () => {
    const ui = setup();
    ui.document.emit('keydown', { key: 'Escape' });
    assert.equal(ui.toggle.focused, false);
    ui.toggle.emit('click');
    ui.document.emit('keydown', { key: 'Tab' });
    assertOpen(ui, true);
    ui.document.emit('keydown', { key: 'Escape' });
    assertOpen(ui, false);
    assert.equal(ui.toggle.focused, true);
});

test('desktop resize resets state; returning to mobile starts closed', () => {
    const ui = setup();
    ui.toggle.emit('click');
    ui.window.innerWidth = 767;
    ui.window.emit('resize');
    assertOpen(ui, true);
    ui.window.innerWidth = 768;
    ui.window.emit('resize');
    assertOpen(ui, false);
    ui.window.innerWidth = 375;
    ui.window.emit('resize');
    assertOpen(ui, false);
    ui.toggle.emit('click');
    assertOpen(ui, true);
});
