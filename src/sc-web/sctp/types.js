ScAddr = function(v) {
    this.value = v;
}

ScAddr.prototype.compare = function(other) {
    return this.value === other.value;
}

ScAddr.prototype.toString = function() {
    return this.value.toString();
}


exports.ScAddr = ScAddr;


// -------------------------------------
exports.SCTP_CMD_UNKNOWN = 0x00;// unkown command
exports.SCTP_CMD_CHECK_ELEMENT = 0x01; // check if specified sc-element exist
exports.SCTP_CMD_GET_ELEMENT_TYPE = 0x02; // return sc-element type
exports.SCTP_CMD_ERASE_ELEMENT = 0x03; // erase specified sc-element
exports.SCTP_CMD_CREATE_NODE = 0x04; // create new sc-node
exports.SCTP_CMD_CREATE_LINK = 0x05; // create new sc-link
exports.SCTP_CMD_CREATE_ARC = 0x06; // create new sc-arc
exports.SCTP_CMD_GET_ARC_BEGIN = 0x07; // return begin element of sc-arc
exports.SCTP_CMD_GET_ARC_END = 0x08; // return end element of sc-arc
exports.SCTP_CMD_GET_LINK_CONTENT = 0x09; // return content of sc-link
exports.SCTP_CMD_FIND_LINKS = 0x0A; // return sc-links with specified content
exports.SCTP_CMD_SET_LINK_CONTENT = 0x0b; // setup new content for the link
exports.SCTP_CMD_ITERATE_ELEMENTS = 0x0C; // return base template iteration result

exports.SCTP_CMD_FIND_ELEMENT_BY_SYSITDF = 0xa0; // return sc-element by it system identifier
exports.SCTP_CMD_SET_SYSIDTF = 0xa1; // setup new system identifier for sc-element
exports.SCTP_CMD_STATISTICS = 0xa2; // return usage statistics from server
exports.SCTP_CMD_SHUTDOWN = 0xfe; // disconnect client from server



exports.SCTP_RESULT_OK = 0x00;
exports.SCTP_RESULT_FAIL = 0x01;
exports.SCTP_RESULT_ERROR_NO_ELEMENT = 0x02;


exports.SCTP_ITERATOR_3F_A_A = 0;
exports.SCTP_ITERATOR_3A_A_F = 1;
exports.SCTP_ITERATOR_3F_A_F = 2;
exports.SCTP_ITERATOR_5F_A_A_A_F = 3;
exports.SCTP_ITERATOR_5_A_A_F_A_F = 4;
exports.SCTP_ITERATOR_5_F_A_F_A_F = 5;
exports.SCTP_ITERATOR_5_F_A_F_A_A = 6;
exports.SCTP_ITERATOR_5_F_A_A_A_A = 7;
exports.SCTP_ITERATOR_5_A_A_F_A_A = 8;


// sc-element types
exports.sc_type_node = 0x1;
exports.sc_type_link = 0x2;
exports.sc_type_edge_common = 0x4;
exports.sc_type_arc_common = 0x8;
exports.sc_type_arc_access = 0x10;

// sc-element constant
exports.sc_type_const = 0x20;
exports.sc_type_var = 0x40;

// sc-element positivity
exports.sc_type_arc_pos = 0x80;
exports.sc_type_arc_neg = 0x100;
exports.sc_type_arc_fuz = 0x200;

// sc-element premanently
exports.sc_type_arc_temp = 0x400;
exports.sc_type_arc_perm = 0x800;

// struct node types
exports.sc_type_node_tuple = 0x80;
exports.sc_type_node_struct = 0x100;
exports.sc_type_node_role = 0x200;
exports.sc_type_node_norole = 0x400;
exports.sc_type_node_class = 0x800;
exports.sc_type_node_abstract = 0x1000;
exports.sc_type_node_material = 0x2000;

exports.sc_type_arc_pos_const_perm = (exports.sc_type_arc_access | exports.sc_type_const | exports.sc_type_arc_pos | exports.sc_type_arc_perm);

// type mask
exports.sc_type_element_mask = (exports.sc_type_node | exports.sc_type_link | exports.sc_type_edge_common | exports.sc_type_arc_common | exports.sc_type_arc_access);
exports.sc_type_constancy_mask = (exports.sc_type_const | exports.sc_type_var);
exports.sc_type_positivity_mask = (exports.sc_type_arc_pos | exports.sc_type_arc_neg | exports.sc_type_arc_fuz);
exports.sc_type_permanency_mask = (exports.sc_type_arc_perm | exports.sc_type_arc_temp);
exports.sc_type_node_struct_mask= (exports.sc_type_node_tuple | exports.sc_type_node_struct | exports.sc_type_node_role | exports.sc_type_node_norole | exports.sc_type_node_class | exports.sc_type_node_abstract | exports.sc_type_node_material);
exports.sc_type_arc_mask = (exports.sc_type_arc_access | exports.sc_type_arc_common | exports.sc_type_edge_common);
