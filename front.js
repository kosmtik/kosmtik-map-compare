L.K.Map.addInitHook(function () {
    this.whenReady(function () {
        var container = L.DomUtil.create('div', 'map-compare-container'),
            title = L.DomUtil.create('h3', '', container),
            params = {
                tms: false,
                url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                active: false
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
            ['active', {handler: L.K.Switch, label: 'Active'}],
            ['tms', {handler: L.K.Switch, label: 'TMS format.'}],
            ['url', {handler: 'BlurInput', helpText: 'URL template.'}]
        ], {id: 'compare-form'});
        // TODO vertical / horizontal view
        builder.on('synced', function (e) {
            if (e.field === 'active') {
                if (params.active) {
                    if (!otherMap) init();
                    L.DomUtil.addClass(document.body, 'map-compare-on');
                    otherMap.invalidateSize();
                    this.invalidateSize();
                } else {
                    L.DomUtil.removeClass(document.body, 'map-compare-on');
                    this.invalidateSize();
                }
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
    });
});
