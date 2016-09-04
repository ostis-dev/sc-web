ScgObjectBuilder = {
    scg_objects: {},
    gwf_objects: {},
    commandList: [],
    scene: null,

    buildObjects: function (gwf_objects) {
        this.gwf_objects = gwf_objects;
        for (var gwf_object_id  in gwf_objects) {
            var gwf_object = gwf_objects[gwf_object_id];
            if (gwf_object.attributes.id in this.scg_objects == false) {
                var scg_object = gwf_object.buildObject({
                    scene: this.scene,
                    builder: this
                });
                this.scg_objects[gwf_object.attributes.id] = scg_object;
                this.commandList.push(new SCgCommandAppendObject(scg_object, this.scene));
            }
        }
        this.scene.commandManager.execute(new SCgWrapperCommand(this.commandList), true);
        this.emptyObjects();
    },

    getOrCreate: function (gwf_object_id) {
        var scg_object;
        if (gwf_object_id in this.scg_objects == false) {
            var gwf_object = this.gwf_objects[gwf_object_id];
            this.scg_objects[gwf_object_id] = gwf_object.buildObject({
                scene: this.scene,
                builder: this
            });
            this.commandList.push(new SCgCommandAppendObject(this.scg_objects[gwf_object_id], this.scene));
        }
        return this.scg_objects[gwf_object_id];
    },

    emptyObjects: function () {
        this.gwf_objects = {};
        this.scg_objects = {};
        this.commandList = [];
    }
}