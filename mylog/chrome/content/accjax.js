// Copyright (c) 2006 IBM Corporation
// All rights reserved.
// 
// This program and the accompanying materials are made available under
// the terms of the Common Public License v1.0 which accompanies
// this distribution, and is available at
// http://www.opensource.org/licenses/cpl1.0.php

const XUL_NS = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";
const X2_NS ="http://www.w3.org/TR/xhtml2"

var gFocusCell = null;
var curCell = null;

function spreadsheet_focus(e) {
    if (e.target.tagName == 'grid') {
	if (!gFocusCell) {
	    gFocusCell = e.target.getElementsByTagName('label')[0];
	}
	gFocusCell.focus();
    } else {
	gFocusCell = e.target;
    }
}

function spreadsheet_keypress(e) {
    switch (e.target.tagName) {
    case 'label':
    case 'description': return cell_keypress(e);
    case 'textbox': return editable_cell_keypress(e);
    }
}

function spreadsheet_click(e) {
	curCell = e.target;
    curCell.focus();
   // start_edit(clickedCell);
    setTimeout("start_curcell_edit();", 1000);
}

const KEY_UP = 38;
const KEY_DOWN = 40;
const KEY_LEFT = 37;
const KEY_RIGHT = 39;
const KEY_ENTER = 13;
const KEY_ESCAPE = 27;

function cell_keypress(e) {
    var current = e.target;
    switch (e.keyCode) {
    case KEY_ENTER:
	if (current.tagName == 'label') {
	    start_edit(current);
	}
	break;
    case KEY_UP:
	spreadsheet_up(current);
	break;
    case KEY_DOWN:
	spreadsheet_down(current);
	break;
    case KEY_LEFT:
	spreadsheet_left(current);
	break;
    case KEY_RIGHT:
	spreadsheet_right(current);
	break;
    }
}

function spreadsheet_up(current) {
    var next = find_cell_up(current);
    if (next) { 
	next.focus();
    }
}

function spreadsheet_down(current) {
    var next = find_cell_down(current);
    if (next) { 
	next.focus();
    }
}

function spreadsheet_left(current) {
    var next = find_cell_left(current);
    if (next) { 
	next.focus();
    }
}

function spreadsheet_right(current) {
    var next = find_cell_right(current);
    if (next) { 
	next.focus();
    }
}

function get_index_within_parent(current) {
    var arSiblings = current.parentNode.childNodes;
    for (var i = 0; i < arSiblings.length; i++) {
	if (arSiblings[i] == current) { return i; }
    }
    return -1;
}

function find_cell_up(current) {
    var row = get_index_within_parent(current);
    var arSiblings = current.parentNode.childNodes;
    return row == 0 ? null : arSiblings[row - 1];
}

function find_cell_down(current) {
    var row = get_index_within_parent(current);
    var arSiblings = current.parentNode.childNodes;
    return row == arSiblings.length - 1 ? null : arSiblings[row + 1];
}

function find_cell_left(current) {
    var row = get_index_within_parent(current);
    var column = get_index_within_parent(current.parentNode);
    var columns = current.parentNode.parentNode.childNodes;
    return column = 0 ? null : columns[column - 1].childNodes[row];
}

function find_cell_right(current) {
    var row = get_index_within_parent(current);
    var column = get_index_within_parent(current.parentNode);
    var columns = current.parentNode.parentNode.childNodes;
    return column == columns.length - 1 ? null : columns[column + 1].childNodes[row];
}

function start_edit(label) {
    var value = label.value;
    setTimeout(function(){
	var textbox = document.createElementNS(XUL_NS, "textbox");
	label.parentNode.replaceChild(textbox, label);
	textbox.value = value;
	textbox.origValue = value;
	textbox.flex = 1;
	textbox.focus();
	textbox.select();
	textbox.addEventListener("blur", editable_cell_blur, true);
	textbox.addEventListener("keypress", editable_cell_keypress, true);
    }, 0);
}

function start_curcell_edit() {
	start_edit(curCell);
}

function done_edit(textbox, keepValue) {
    var value = textbox.value;
    var label = document.createElementNS(XUL_NS, "label");
    label.setAttributeNS(X2_NS, "role", "wairole:gridcell");
    textbox.parentNode.replaceChild(label, textbox);
    if (keepValue) {
	label.value = value;
    } else {
	label.value = textbox.origValue;
    }
    label.flex = 1;
    label.addEventListener("keypress", cell_keypress, true);
    return label;
}

function editable_cell_blur(e) {
    var textbox = e.target;
    setTimeout(function() {
	done_edit(textbox, true);
    }, 0);
}

function editable_cell_keypress(e) {
    var textbox = e.target;
    switch (e.keyCode) {
    case KEY_ENTER:
	setTimeout(function() {
	    var label = done_edit(textbox, true);
	    label.focus();
	}, 0);
	break;
    case KEY_ESCAPE:
	setTimeout(function() {
	    var label = done_edit(textbox, false);
	    label.focus();
	}, 0);
	break;
    }
}

function install_handlers() {
    var spreadsheet = window.document.getElementById('accjaxspreadsheet');
    spreadsheet.addEventListener('keypress', spreadsheet_keypress, true);
    spreadsheet.addEventListener('focus', spreadsheet_focus, true);
    spreadsheet.addEventListener('click', spreadsheet_click, true);
}
