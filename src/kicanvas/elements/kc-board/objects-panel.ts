/*
    Copyright (c) 2023 Alethea Katherine Flowers.
    Published under the standard MIT License.
    Full text available at: https://opensource.org/licenses/MIT
*/

import { delegate } from "../../../base/events";
import { html } from "../../../base/web-components";
import { KCUIElement, type KCUIRangeElement } from "../../../kc-ui";
import { BoardViewer } from "../../../viewers/board/viewer";

const DEFAULT_OPACITY = {
    tracks: 1,
    vias: 1,
    pads: 1,
    holes: 1,
    zones: 0.25,
    grid: 1,
    page: 1,
};

export class KCBoardObjectsPanelElement extends KCUIElement {
    viewer: BoardViewer;

    override connectedCallback() {
        (async () => {
            this.viewer = await this.requestLazyContext("viewer");
            await this.viewer.loaded;
            super.connectedCallback();
            this.setup_events();
        })();
    }

    private setup_events() {
        // TODO: is there a better spot for this?
        // Set default opacity values
        this.viewer.track_opacity = DEFAULT_OPACITY.tracks;
        this.viewer.via_opacity = DEFAULT_OPACITY.vias;
        this.viewer.pad_opacity = DEFAULT_OPACITY.pads;
        this.viewer.pad_hole_opacity = DEFAULT_OPACITY.holes;
        this.viewer.zone_opacity = DEFAULT_OPACITY.zones;
        this.viewer.grid_opacity = DEFAULT_OPACITY.grid;
        this.viewer.page_opacity = DEFAULT_OPACITY.page;

        delegate(this.renderRoot, "kc-ui-range", "kc-ui-range:input", (e) => {
            const control = e.target as KCUIRangeElement;
            const opacity = control.valueAsNumber;
            switch (control.name) {
                case "tracks":
                    this.viewer.track_opacity = opacity;
                    break;
                case "vias":
                    this.viewer.via_opacity = opacity;
                    break;
                case "pads":
                    this.viewer.pad_opacity = opacity;
                    break;
                case "holes":
                    this.viewer.pad_hole_opacity = opacity;
                    break;
                case "zones":
                    this.viewer.zone_opacity = opacity;
                    break;
                case "grid":
                    this.viewer.grid_opacity = opacity;
                    break;
                case "page":
                    this.viewer.page_opacity = opacity;
                    break;
            }
        });
    }

    override render() {
        return html`
            <kc-ui-panel>
                <kc-ui-panel-title title="Objects"></kc-ui-panel-title>
                <kc-ui-panel-body padded>
                    <kc-ui-control-list>
                        <kc-ui-control>
                            <label>Tracks</label>
                            <kc-ui-range
                                min="0"
                                max="1.0"
                                step="0.01"
                                value="${DEFAULT_OPACITY.tracks}"
                                name="tracks"></kc-ui-range>
                        </kc-ui-control>
                        <kc-ui-control>
                            <label>Vias</label>
                            <kc-ui-range
                                min="0"
                                max="1.0"
                                step="0.01"
                                value="${DEFAULT_OPACITY.vias}"
                                name="vias"></kc-ui-range>
                        </kc-ui-control>
                        <kc-ui-control>
                            <label>Pads</label>
                            <kc-ui-range
                                min="0"
                                max="1.0"
                                step="0.01"
                                value="${DEFAULT_OPACITY.pads}"
                                name="pads"></kc-ui-range>
                        </kc-ui-control>
                        <kc-ui-control>
                            <label>Through holes</label>
                            <kc-ui-range
                                min="0"
                                max="1.0"
                                step="0.01"
                                value="${DEFAULT_OPACITY.holes}"
                                name="holes"></kc-ui-range>
                        </kc-ui-control>
                        <kc-ui-control>
                            <label>Zones</label>
                            <kc-ui-range
                                min="0"
                                max="1.0"
                                step="0.01"
                                value="${DEFAULT_OPACITY.zones}"
                                name="zones"></kc-ui-range>
                        </kc-ui-control>
                        <kc-ui-control>
                            <label>Grid</label>
                            <kc-ui-range
                                min="0"
                                max="1.0"
                                step="0.01"
                                value="${DEFAULT_OPACITY.grid}"
                                name="grid"></kc-ui-range>
                        </kc-ui-control>
                        <kc-ui-control>
                            <label>Page</label>
                            <kc-ui-range
                                min="0"
                                max="1.0"
                                step="0.01"
                                value="${DEFAULT_OPACITY.page}"
                                name="page"></kc-ui-range>
                        </kc-ui-control>
                    </kc-ui-control-list>
                </kc-ui-panel-body>
            </kc-ui-panel>
        `;
    }
}

window.customElements.define(
    "kc-board-objects-panel",
    KCBoardObjectsPanelElement,
);
