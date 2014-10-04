L.K.Map.addInitHook(function () {
    this.whenReady(function () {
        var container = L.DomUtil.create('div', 'map-compare-container'),
            title = L.DomUtil.create('h3', '', container),
            params = {
                tms: false,
                url: L.K.Config.project.compareUrl,
                active: false,
                minZoom: this.options.minZoom,
                maxZoom: this.options.maxZoom
            };
        title.innerHTML = 'Map compare';
        var tilelayer, otherMap,
            init = function () {
                var container = L.DomUtil.create('div', 'map-compare', document.body);
                container.id = 'mapCompare';
                otherMap = L.map(container.id, {attributionControl: false});
                tilelayer = L.tileLayer(params.url, params).addTo(otherMap);
                new L.Hash(otherMap);
            };
        var builder = new L.K.FormBuilder(params, [
            ['active', {handler: L.K.Switch, label: 'Active (ctrl+alt+C)'}],
            ['tms', {handler: L.K.Switch, label: 'TMS format.'}],
            ['url', {handler: 'BlurInput', helpText: 'URL template.'}]
        ], {id: 'compare-form'});
        // TODO vertical / horizontal view
        var toggle = function () {
            if (params.active) {
                if (!otherMap) init();
                L.DomUtil.addClass(document.body, 'map-compare-on');
                otherMap.invalidateSize();
                this.invalidateSize();
            } else {
                L.DomUtil.removeClass(document.body, 'map-compare-on');
                this.invalidateSize();
            }
        }
        builder.on('synced', function (e) {
            if (e.field === 'active') {
                L.bind(toggle, this)();
            } else if (e.field === 'url' && tilelayer) {
                tilelayer.setUrl(params.url);
            }
        }, this);
        container.appendChild(builder.build());
        this.sidebar.addTab({
            label: 'Compare',
            content: container
        });
        this.sidebar.rebuild();
        var shortcutCallback = function () {
            params.active = !params.active;
            L.bind(toggle, this)();
            builder.fetchAll();
        };
        this.shortcuts.add({
            keyCode: L.K.Keys.C,
            ctrlKey: true,
            altKey: true,
            callback: shortcutCallback,
            context: this,
            description: 'Toggle map compare view'
        });
    });
});
