"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dumbbell, Plus, Trash2, Trophy, X, CheckCircle2 } from "lucide-react";
import RestTimer from "@/components/shared/RestTimer";

const MUSCLE_GROUPS = ["Chest", "Back", "Legs", "Shoulders", "Arms", "Core"];

interface SetEntry {
  reps: string;
  weightKg: string;
  done: boolean; // true once the set has been completed
}

interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  sets: SetEntry[];
  isPRPreview?: boolean;
  bestVolumeKg?: number;
  /** Index of the set currently resting after. null = no rest active. */
  restingAfterSet: number | null;
  /** Increment to remount RestTimer when a new rest starts */
  restKey: number;
}

interface LibraryExercise {
  exerciseName: string;
  muscleGroup: string;
}

interface Props {
  onExercisesChange: (
    exercises: Omit<Exercise, "restingAfterSet" | "restKey">[]
  ) => void;
}

export default function ExerciseLogger({ onExercisesChange }: Props) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [library, setLibrary] = useState<LibraryExercise[]>([]);
  const [prHistory, setPrHistory] = useState<Record<string, number>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newGroup, setNewGroup] = useState("Chest");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/exercises?library=true")
      .then((r) => r.json())
      .then((d) => {
        if (d.exercises) setLibrary(d.exercises);
      });
    fetch("/api/exercises")
      .then((r) => r.json())
      .then((d) => {
        if (d.logs) {
          const map: Record<string, number> = {};
          for (const log of d.logs) {
            const key = log.exerciseName.toLowerCase();
            if (!map[key] || log.volumeKg > map[key]) map[key] = log.volumeKg;
          }
          setPrHistory(map);
        }
      });
  }, []);

  /** Notify parent — strips internal-only fields */
  const notify = (updated: Exercise[]) => {
    setExercises(updated);
    onExercisesChange(
      updated.map(({ restingAfterSet: _r, restKey: _k, ...rest }) => rest)
    );
  };

  const filteredLibrary = library.filter((l) =>
    l.exerciseName.toLowerCase().includes(newName.toLowerCase())
  );

  const addExercise = () => {
    if (!newName.trim()) return;
    const ex: Exercise = {
      id: Math.random().toString(36).slice(2),
      name: newName.trim(),
      muscleGroup: newGroup,
      sets: [{ reps: "", weightKg: "", done: false }],
      restingAfterSet: null,
      restKey: 0,
    };
    notify([...exercises, ex]);
    setNewName("");
    setNewGroup("Chest");
    setShowAddForm(false);
    setShowSuggestions(false);
  };

  const removeExercise = (id: string) =>
    notify(exercises.filter((e) => e.id !== id));

  const updateSet = (
    id: string,
    si: number,
    field: keyof Omit<SetEntry, "done">,
    val: string
  ) => {
    const updated = exercises.map((e) => {
      if (e.id !== id) return e;
      const sets = e.sets.map((s, i) => (i === si ? { ...s, [field]: val } : s));
      const volume = sets.reduce(
        (sum, s) => sum + (parseFloat(s.reps) || 0) * (parseFloat(s.weightKg) || 0),
        0
      );
      const key = e.name.toLowerCase();
      const isPRPreview = volume > 0 && volume > (prHistory[key] || 0);
      return { ...e, sets, volumeKg: volume, isPRPreview, bestVolumeKg: prHistory[key] };
    });
    notify(updated);
  };

  const removeSet = (id: string, si: number) =>
    notify(
      exercises.map((e) =>
        e.id === id
          ? { ...e, sets: e.sets.filter((_, i) => i !== si) }
          : e
      )
    );

  /** User taps ✓ Done — marks set as done and starts rest timer */
  const finishSet = (id: string, si: number) => {
    notify(
      exercises.map((e) => {
        if (e.id !== id) return e;
        const sets = e.sets.map((s, i) =>
          i === si ? { ...s, done: true } : s
        );
        return {
          ...e,
          sets,
          restingAfterSet: si,
          restKey: e.restKey + 1,
        };
      })
    );
  };

  /** Called when rest ends (timer complete OR skip) → append next empty set */
  const endRest = (id: string) => {
    notify(
      exercises.map((e) => {
        if (e.id !== id) return e;
        // Only add new set if last set is done (avoid duplicates on multi-click)
        const lastDone = e.sets.every((s) => s.done);
        return {
          ...e,
          restingAfterSet: null,
          sets: lastDone
            ? [...e.sets, { reps: "", weightKg: "", done: false }]
            : e.sets,
        };
      })
    );
  };

  return (
    <Card className="border-l-2 border-l-[var(--push-color)]">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm text-[var(--text-muted)] flex items-center gap-2">
          <Dumbbell className="w-4 h-4" /> Exercises Logged
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {exercises.map((ex) => {
          const volume = ex.sets.reduce(
            (sum, s) =>
              sum + (parseFloat(s.reps) || 0) * (parseFloat(s.weightKg) || 0),
            0
          );

          return (
            <div
              key={ex.id}
              className="bg-[var(--bg-dark)] rounded-xl p-3 border border-white/5 space-y-3"
            >
              {/* Exercise header */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-white text-sm">{ex.name}</div>
                  <div className="text-[10px] text-[var(--text-muted)]">
                    {ex.muscleGroup}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {ex.isPRPreview && (
                    <div className="flex items-center gap-1 bg-[var(--xp-gold)]/15 border border-[var(--xp-gold)]/30 rounded-full px-2 py-0.5 text-[10px] cinzel text-[var(--xp-gold)] font-bold animate-pulse">
                      <Trophy className="w-3 h-3" /> NEW PR!
                    </div>
                  )}
                  <button
                    onClick={() => removeExercise(ex.id)}
                    className="text-[var(--text-muted)] hover:text-red-400 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Sets */}
              <div className="space-y-3">
                {/* Column header */}
                <div className="grid grid-cols-[1.5rem_1fr_1fr_auto] gap-2 text-[10px] text-[var(--text-muted)] uppercase tracking-wider px-1">
                  <div>#</div>
                  <div>Reps</div>
                  <div>kg</div>
                  <div />
                </div>

                {ex.sets.map((s, si) => {
                  const isResting = ex.restingAfterSet === si;
                  const isDone = s.done;

                  return (
                    <div key={si} className="space-y-2">
                      {/* Set row */}
                      <div
                        className={`grid grid-cols-[1.5rem_1fr_1fr_auto] gap-2 items-center transition-opacity ${
                          isDone && !isResting ? "opacity-50" : "opacity-100"
                        }`}
                      >
                        {/* Set number */}
                        <div
                          className={`text-xs text-center font-mono font-bold ${
                            isDone
                              ? "text-[var(--cardio-color)]"
                              : "text-[var(--text-muted)]"
                          }`}
                        >
                          {isDone ? (
                            <CheckCircle2 className="w-3.5 h-3.5 inline" />
                          ) : (
                            si + 1
                          )}
                        </div>

                        {/* Reps */}
                        <Input
                          type="number"
                          placeholder="12"
                          value={s.reps}
                          readOnly={isDone}
                          onChange={(e) =>
                            updateSet(ex.id, si, "reps", e.target.value)
                          }
                          className={`h-9 text-center ${isDone ? "cursor-default" : ""}`}
                        />

                        {/* Weight */}
                        <Input
                          type="number"
                          placeholder="60"
                          value={s.weightKg}
                          readOnly={isDone}
                          onChange={(e) =>
                            updateSet(ex.id, si, "weightKg", e.target.value)
                          }
                          className={`h-9 text-center ${isDone ? "cursor-default" : ""}`}
                        />

                        {/* Action button */}
                        {isDone ? (
                          // Allow removal of a done set
                          <button
                            onClick={() => removeSet(ex.id, si)}
                            disabled={ex.sets.length === 1}
                            className="flex justify-center text-[var(--text-muted)] hover:text-red-400 disabled:opacity-20 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => finishSet(ex.id, si)}
                            disabled={!s.reps || !s.weightKg}
                            className="flex justify-center text-[var(--cardio-color)] disabled:text-[var(--text-muted)] disabled:opacity-30 hover:scale-110 transition-all"
                            title="Done — start rest"
                          >
                            <CheckCircle2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>

                      {/* Rest timer — shown inline below the set just completed */}
                      {isResting && (
                        <div
                          key={ex.restKey}
                          className="rounded-xl border border-white/10 bg-[var(--panel-bg)] px-3 pb-3 fade-in-up"
                        >
                          <p className="text-[10px] text-[var(--text-muted)] text-center pt-2 mb-1 uppercase tracking-widest">
                            Rest — Set {si + 1} done ✓
                          </p>
                          <RestTimer
                            initialSeconds={90}
                            onComplete={() => endRest(ex.id)}
                            onSkip={() => endRest(ex.id)}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Footer: manual add set + volume */}
              <div className="flex items-center justify-between pt-1">
                {/* Only show manual add-set if no rest is active */}
                {ex.restingAfterSet === null && (
                  <button
                    onClick={() =>
                      notify(
                        exercises.map((e) =>
                          e.id === ex.id
                            ? {
                                ...e,
                                sets: [
                                  ...e.sets,
                                  { reps: "", weightKg: "", done: false },
                                ],
                              }
                            : e
                        )
                      )
                    }
                    className="text-xs text-[var(--text-muted)] hover:text-white flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3 h-3" /> Add Set
                  </button>
                )}
                {volume > 0 && (
                  <div className="ml-auto text-xs text-[var(--text-muted)]">
                    Vol:{" "}
                    <span className="font-bold text-white">
                      {volume.toFixed(0)} kg
                    </span>
                    {ex.bestVolumeKg != null && ex.bestVolumeKg > 0 && (
                      <span className="ml-1 opacity-50">
                        (PR: {ex.bestVolumeKg.toFixed(0)})
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Add exercise form */}
        {showAddForm ? (
          <div className="bg-[var(--bg-dark)] rounded-xl p-3 border border-white/10 space-y-3 fade-in-up">
            <div className="relative">
              <Input
                ref={inputRef}
                placeholder="Exercise name (e.g. Bench Press)"
                value={newName}
                onChange={(e) => {
                  setNewName(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                autoFocus
              />
              {showSuggestions && filteredLibrary.length > 0 && (
                <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-[var(--panel-bg)] border border-white/10 rounded-lg overflow-hidden shadow-xl max-h-40 overflow-y-auto">
                  {filteredLibrary.map((l) => (
                    <button
                      key={l.exerciseName}
                      onMouseDown={() => {
                        setNewName(l.exerciseName);
                        setNewGroup(l.muscleGroup);
                        setShowSuggestions(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors flex justify-between"
                    >
                      <span className="text-white">{l.exerciseName}</span>
                      <span className="text-[var(--text-muted)] text-xs">
                        {l.muscleGroup}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Muscle group chips */}
            <div className="flex flex-wrap gap-2">
              {MUSCLE_GROUPS.map((g) => (
                <button
                  key={g}
                  onClick={() => setNewGroup(g)}
                  className={`px-2.5 py-1 rounded-full text-xs font-bold border transition-all ${
                    newGroup === g
                      ? "bg-[var(--xp-gold)]/20 border-[var(--xp-gold)] text-[var(--xp-gold)]"
                      : "border-white/10 text-[var(--text-muted)] hover:border-white/30"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <Button
                onClick={addExercise}
                disabled={!newName.trim()}
                size="sm"
                className="flex-1"
              >
                Add
              </Button>
              <Button
                onClick={() => {
                  setShowAddForm(false);
                  setNewName("");
                }}
                size="sm"
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full flex items-center justify-center gap-2 p-3 bg-white/5 rounded-xl border border-dashed border-white/15 text-sm text-[var(--text-muted)] hover:text-white hover:border-white/30 hover:bg-white/8 transition-all"
          >
            <Plus className="w-4 h-4" /> Add Exercise
          </button>
        )}
      </CardContent>
    </Card>
  );
}
