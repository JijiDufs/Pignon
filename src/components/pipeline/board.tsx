"use client";

import { useState } from "react";
import {
  closestCenter,
  DndContext,
  DragOverlay,
  getFirstCollision,
  KeyboardSensor,
  MouseSensor,
  pointerWithin,
  rectIntersection,
  TouchSensor,
  useDroppable,
  useSensor,
  useSensors,
  type Announcements,
  type CollisionDetection,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { PIPELINE_STAGES } from "@/lib/data";
import { formatEuro } from "@/lib/format";
import type { PipelineStage } from "@/lib/types";
import { cn } from "@/lib/utils";
import { PipelineCard, type CardData } from "./card";
import { BOARD_STAGES, entryValue, type Columns } from "./model";

const LABEL = Object.fromEntries(PIPELINE_STAGES.map((stage) => [stage.id, stage.label])) as Record<PipelineStage, string>;

function isStage(id: UniqueIdentifier): id is PipelineStage {
  return typeof id === "string" && id in LABEL;
}

/** The column a card or a column id belongs to. */
function columnOf(columns: Columns, id: UniqueIdentifier): PipelineStage | undefined {
  if (isStage(id)) return id;
  return BOARD_STAGES.find((stage) => columns[stage].includes(String(id)));
}

interface BoardProps {
  columns: Columns;
  cards: Record<string, CardData>;
  now: number;
  /** Id of the card that was just signed */
  litId?: string | null;
  /** Without it the board is a still picture (the preview behind the lock) */
  onPlace?: (id: string, stage: PipelineStage, columnIds: string[]) => void;
  onRemove?: (id: string) => void;
}

/** The pipeline as columns of cards. Drag with the mouse, a finger or the keyboard; every card also has a "Déplacer vers" menu. */
export function Board({ columns, cards, now, litId, onPlace, onRemove }: BoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  // Where the cards stand while one of them is being dragged.
  const [draft, setDraft] = useState<Columns | null>(null);
  const shown = draft ?? columns;

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    // A short press before dragging, so a finger can still scroll the board.
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const name = (id: UniqueIdentifier) => cards[String(id)]?.business.name ?? "La carte";
  const announcements: Announcements = {
    onDragStart: ({ active }) => `${name(active.id)} est saisi.`,
    onDragOver: ({ active, over }) => {
      const stage = over ? columnOf(shown, over.id) : undefined;
      return stage ? `${name(active.id)} est au-dessus de la colonne ${LABEL[stage]}.` : `${name(active.id)} n'est au-dessus d'aucune colonne.`;
    },
    onDragEnd: ({ active, over }) => {
      const stage = over ? columnOf(shown, over.id) : undefined;
      return stage ? `${name(active.id)} est déposé dans la colonne ${LABEL[stage]}.` : `${name(active.id)} est reposé à sa place.`;
    },
    onDragCancel: ({ active }) => `Déplacement annulé. ${name(active.id)} revient à sa place.`,
  };

  // What is under the card: the pointer decides for a mouse or a finger, the card's own rectangle for the keyboard.
  // Over a column, aim at the nearest card inside it, so the card slots between its neighbours.
  const collisionDetection: CollisionDetection = (args) => {
    const pointer = pointerWithin(args);
    const hit = getFirstCollision(pointer.length > 0 ? pointer : rectIntersection(args), "id");
    if (hit == null) return [];
    if (!isStage(hit) || shown[hit].length === 0) return [{ id: hit }];
    const inside = args.droppableContainers.filter((container) => shown[hit].includes(String(container.id)));
    return [{ id: closestCenter({ ...args, droppableContainers: inside })[0]?.id ?? hit }];
  };

  const onDragStart = ({ active }: DragStartEvent) => {
    setActiveId(String(active.id));
    setDraft(columns);
  };

  const onDragOver = ({ active, over }: DragOverEvent) => {
    if (!over) return;
    const id = String(active.id);
    setDraft((current) => {
      if (!current) return current;
      const from = columnOf(current, id);
      const to = columnOf(current, over.id);
      if (!from || !to || from === to) return current;
      const index = current[to].indexOf(String(over.id));
      const target = [...current[to]];
      target.splice(index === -1 ? target.length : index, 0, id);
      return { ...current, [from]: current[from].filter((item) => item !== id), [to]: target };
    });
  };

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    const id = String(active.id);
    let final = draft;
    setActiveId(null);
    setDraft(null);
    if (!final || !over) return;
    const stage = columnOf(final, id);
    if (!stage) return;
    const from = final[stage].indexOf(id);
    const to = final[stage].indexOf(String(over.id));
    if (to !== -1 && to !== from) final = { ...final, [stage]: arrayMove(final[stage], from, to) };
    onPlace?.(id, stage, final[stage]);
  };

  const lanes = (
    <div className="relative flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 scrollbar-fin lg:grid lg:grid-cols-5 lg:overflow-visible lg:pb-0">
      {BOARD_STAGES.map((stage) => (
        <Lane key={stage} stage={stage} ids={shown[stage]} cards={cards} still={!onPlace}>
          {shown[stage].map((id) =>
            cards[id] ? (
              <SortableCard key={id} id={id} label={cards[id].business.name} still={!onPlace}>
                <PipelineCard
                  data={cards[id]}
                  now={now}
                  stage={stage}
                  lit={litId === id}
                  onMove={onPlace ? (next) => onPlace(id, next, [id, ...columns[next].filter((item) => item !== id)]) : undefined}
                  onRemove={onRemove ? () => onRemove(id) : undefined}
                />
              </SortableCard>
            ) : null,
          )}
        </Lane>
      ))}
    </div>
  );

  if (!onPlace) return lanes;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      onDragCancel={() => {
        setActiveId(null);
        setDraft(null);
      }}
      accessibility={{
        announcements,
        screenReaderInstructions: {
          draggable:
            "Pour déplacer une carte, appuie sur Espace ou Entrée. Utilise les flèches pour la déplacer, Espace ou Entrée pour la déposer, Échap pour annuler.",
        },
      }}
    >
      {lanes}
      <DragOverlay dropAnimation={{ duration: 220, easing: "cubic-bezier(0.22, 1, 0.36, 1)" }}>
        {activeId && cards[activeId] ? (
          // The card in hand: lifted off the board, slightly turned.
          <PipelineCard
            data={cards[activeId]}
            now={now}
            stage={columnOf(shown, activeId) ?? cards[activeId].entry.stage}
            className="scale-[1.03] rotate-[1.5deg] cursor-grabbing shadow-halo"
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

interface LaneProps {
  stage: PipelineStage;
  ids: string[];
  cards: Record<string, CardData>;
  still: boolean;
  children: React.ReactNode;
}

function Lane({ stage, ids, cards, still, children }: LaneProps) {
  const { setNodeRef, isOver } = useDroppable({ id: stage, disabled: still });
  const value = ids.reduce((sum, id) => (cards[id] ? sum + entryValue({ ...cards[id].entry, stage }, cards[id].business) : sum), 0);

  return (
    <section aria-label={`${LABEL[stage]}, ${ids.length} ${ids.length > 1 ? "commerces" : "commerce"}`} className="flex w-[82vw] max-w-[320px] shrink-0 snap-start flex-col lg:w-auto lg:max-w-none lg:min-w-0">
      <header className={cn("flex items-baseline gap-2 border-t pt-3 pb-3", stage === "won" ? "border-lumiere" : "border-craie")}>
        <h2 className="titre text-base whitespace-nowrap">{LABEL[stage]}</h2>
        <span className="cote text-ui text-pave">{ids.length}</span>
        <span className="cote ml-auto text-ui text-brume">{formatEuro(value)}</span>
      </header>
      <SortableContext items={ids} strategy={verticalListSortingStrategy} disabled={still}>
        <div ref={setNodeRef} className={cn("flex min-h-28 flex-1 flex-col gap-2.5 rounded-xl transition-colors", isOver && "bg-nuit-700")}>
          {children}
          {ids.length === 0 && (
            <p className="grid h-20 place-items-center rounded-xl border border-dashed border-trait-fort text-ui text-pave">Dépose une carte ici</p>
          )}
        </div>
      </SortableContext>
    </section>
  );
}

function SortableCard({ id, label, still, children }: { id: string; label: string; still: boolean; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, disabled: still });
  if (still) return <div>{children}</div>;

  return (
    // A group, not dnd-kit's default button: the card holds a link and a menu of its own.
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      role="group"
      tabIndex={0}
      aria-label={label}
      aria-roledescription="carte déplaçable"
      aria-describedby={attributes["aria-describedby"]}
      {...listeners}
      className={cn("cursor-grab touch-manipulation rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-craie focus-visible:ring-offset-2", isDragging && "opacity-35")}
    >
      {children}
    </div>
  );
}
