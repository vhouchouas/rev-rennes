export enum DisplayedLayer {
    Progress = 0,
    Expected = 1
}

export default class LayerControl {
    _defaultLayer: DisplayedLayer;
    _displayLayerType: boolean;
    _container: HTMLDivElement;
    _onChange: Function;
    _onClick: Function;


    constructor(defaultLayer: DisplayedLayer, displayLayerType: boolean, onClick: Function, onChange: Function) {
        this._defaultLayer = defaultLayer
        this._displayLayerType = displayLayerType
        this._onChange = onChange;
        this._onClick = onClick;
    }

    onAdd() {
        this._container = document.createElement('div');
        this._container.className = 'maplibregl-ctrl-group maplibregl-ctrl layercontrol';

        let title = document.createElement("LayerControlTitle")
        title.className = "layercontrol-title"
        title.appendChild(document.createTextNode("Visualisation"))
        this._container.appendChild(title);

        this.createRadioButton('progress', 'de l\'avancement du projet', this._defaultLayer == DisplayedLayer.Progress);
        this.createRadioButton('expected', 'du réseau attendu par les usagers', this._defaultLayer == DisplayedLayer.Expected);

        return this._container;
    }

    createRadioButton(value: string, label: string, tryCheck: boolean = false) {
        let radioButtonContainer = document.createElement('div');

        const radioButton = document.createElement('input');
        const radioLabel = document.createElement('label');

        radioButton.type = 'radio';
        radioButton.name = 'map-radio-options';
        radioButton.value = value;
        radioButton.id = value;
        radioButton.onclick = () => {
            this._onChange(value);
        }

        radioLabel.htmlFor = value;
        radioLabel.textContent = label;

        radioButtonContainer.appendChild(radioButton);
        radioButtonContainer.appendChild(document.createTextNode(" "));
        radioButtonContainer.appendChild(radioLabel);
        radioButton.checked = tryCheck

        this._container.appendChild(radioButtonContainer);
    }

    onRemove() {
        if (this._container && this._container.parentNode) {
            this._container.parentNode.removeChild(this._container);
        }
    }
}