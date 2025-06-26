/*
    Copyright (c) 2022 Alethea Katherine Flowers.
    Published under the standard MIT License.
    Full text available at: https://opensource.org/licenses/MIT
*/

import { BBox, Vec2 } from "../../base/math";
import { is_string } from "../../base/types";
import { Renderer } from "../../graphics";
import { WebGL2Renderer } from "../../graphics/webgl";
import type { BoardTheme } from "../../kicad";
import * as board_items from "../../kicad/board";
import { DocumentViewer } from "../base/document-viewer";
import { LayerNames, LayerSet, ViewLayer } from "./layers";
import { BoardPainter } from "./painter";

export class BoardViewer extends DocumentViewer<
    board_items.KicadPCB,
    BoardPainter,
    LayerSet,
    BoardTheme
> {
    get board(): board_items.KicadPCB {
        return this.document;
    }

    protected override create_renderer(canvas: HTMLCanvasElement): Renderer {
        const renderer = new WebGL2Renderer(canvas);
        return renderer;
    }

    protected override create_painter() {
        return new BoardPainter(this.renderer, this.layers, this.theme);
    }

    protected override create_layer_set() {
        return new LayerSet(this.board, this.theme);
    }

    protected override get grid_origin() {
        return this.board.setup?.grid_origin ?? new Vec2(0, 0);
    }

    protected override on_pick(
        mouse: Vec2,
        items: Generator<{ layer: ViewLayer; bbox: BBox }, void, unknown>,
    ): void {
        let selected = null;

        for (const { layer: _, bbox } of items) {
            if (bbox.context instanceof board_items.Footprint) {
                selected = bbox.context;
                break;
            }
        }

        this.select(selected);
    }

    override select(item: board_items.Footprint | string | BBox | null) {
        // If item is a string, find the footprint by uuid or reference.
        if (is_string(item)) {
            item = this.board.find_footprint(item);
        }

        // If it's a footprint, use the footprint's nominal bounding box.
        if (item instanceof board_items.Footprint) {
            item = item.bbox;
        }

        super.select(item);
    }

    /**
     * Override zoom_to_page to zoom to board if possible
     */
    public override zoom_to_page() {
        if (!this.zoom_to_board()) {
            super.zoom_to_page();
        }
    }

    highlight_net(net: number) {
        this.painter.paint_net(this.board, net);
        this.draw();
    }

    private set_layers_opacity(layers: Generator<ViewLayer>, opacity: number) {
        for (const layer of layers) {
            layer.opacity = opacity;
        }
        this.draw();
    }

    set track_opacity(value: number) {
        this.set_layers_opacity(
            (this.layers as LayerSet).copper_layers(),
            value,
        );
    }

    set via_opacity(value: number) {
        this.set_layers_opacity((this.layers as LayerSet).via_layers(), value);
    }

    set zone_opacity(value: number) {
        this.set_layers_opacity((this.layers as LayerSet).zone_layers(), value);
    }

    set pad_opacity(value: number) {
        this.set_layers_opacity((this.layers as LayerSet).pad_layers(), value);
    }

    set pad_hole_opacity(value: number) {
        this.set_layers_opacity(
            (this.layers as LayerSet).pad_hole_layers(),
            value,
        );
    }

    set grid_opacity(value: number) {
        this.set_layers_opacity((this.layers as LayerSet).grid_layers(), value);
    }

    set page_opacity(value: number) {
        this.layers.by_name(LayerNames.drawing_sheet)!.opacity = value;
        this.draw();
    }

    zoom_to_board(): boolean {
        const bboxes: BBox[] = [];
        const edge_cuts = this.layers.by_name(LayerNames.edge_cuts);
        if (edge_cuts) {
            bboxes.push(edge_cuts.bbox);
        }

        const layer_filter = (
            elem:
                | board_items.Text
                | board_items.GraphicItem
                | board_items.Property,
        ) => {
            const layer =
                typeof elem.layer === "string" ? elem.layer : elem.layer.name;
            return (
                (layer.startsWith("F.") || layer.startsWith("B.")) &&
                !layer.endsWith("Fab")
            );
        };

        for (const collection of [
            this.board.footprints,
            this.board.segments,
            this.board.vias,
            this.board.zones,
            this.board.drawings,
        ]) {
            for (const elem of collection) {
                if (elem instanceof board_items.Dimension) {
                    continue;
                }
                // filter non-visible layers in graphics
                if (elem instanceof board_items.GraphicItem) {
                    if (!layer_filter(elem)) {
                        continue;
                    }
                }
                let bbox = undefined;
                if (elem instanceof board_items.Footprint) {
                    bbox = elem.get_bbox(layer_filter);
                } else {
                    bbox = elem.bbox;
                }
                bboxes.push(bbox);
            }
        }

        if (bboxes.length === 0) {
            return false;
        }
        const board_bbox = BBox.combine(bboxes);
        this.viewport.camera.bbox = board_bbox.grow(
            board_bbox.w * 0.1,
            board_bbox.h * 0.1,
        );
        this.draw();
        return true;
    }
}
