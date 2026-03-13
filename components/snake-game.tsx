"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Pause,
  Play,
  RotateCcw
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";
type Cell = { x: number; y: number };

const BOARD_SIZE = 18;
const TICK_MS = 110;

const directions: Record<Direction, Cell> = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 }
};

function sameCell(a: Cell, b: Cell) {
  return a.x === b.x && a.y === b.y;
}

function randomFood(snake: Cell[]) {
  const occupied = new Set(snake.map((part) => `${part.x}-${part.y}`));
  const free: Cell[] = [];

  for (let y = 0; y < BOARD_SIZE; y += 1) {
    for (let x = 0; x < BOARD_SIZE; x += 1) {
      if (!occupied.has(`${x}-${y}`)) {
        free.push({ x, y });
      }
    }
  }

  return free[Math.floor(Math.random() * free.length)] ?? { x: 0, y: 0 };
}

function initialSnake() {
  const center = Math.floor(BOARD_SIZE / 2);
  return [
    { x: center - 2, y: center },
    { x: center - 1, y: center },
    { x: center, y: center }
  ];
}

export function SnakeGame() {
  const [snake, setSnake] = useState<Cell[]>(initialSnake);
  const [direction, setDirection] = useState<Direction>("RIGHT");
  const [queuedDirection, setQueuedDirection] = useState<Direction>("RIGHT");
  const [food, setFood] = useState<Cell>(() => randomFood(initialSnake()));
  const [running, setRunning] = useState(true);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const snakeMap = useMemo(() => {
    const map = new Map<string, number>();
    snake.forEach((part, index) => {
      map.set(`${part.x}-${part.y}`, index);
    });
    return map;
  }, [snake]);

  useEffect(() => {
    const keyMap: Record<string, Direction> = {
      ArrowUp: "UP",
      ArrowDown: "DOWN",
      ArrowLeft: "LEFT",
      ArrowRight: "RIGHT",
      w: "UP",
      s: "DOWN",
      a: "LEFT",
      d: "RIGHT"
    };

    const handler = (event: KeyboardEvent) => {
      const next = keyMap[event.key];
      if (!next) return;
      event.preventDefault();
      setQueuedDirection(next);
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (!running || gameOver) return;

    const interval = setInterval(() => {
      setSnake((prevSnake) => {
        const head = prevSnake[prevSnake.length - 1];
        const opposite =
          (direction === "UP" && queuedDirection === "DOWN") ||
          (direction === "DOWN" && queuedDirection === "UP") ||
          (direction === "LEFT" && queuedDirection === "RIGHT") ||
          (direction === "RIGHT" && queuedDirection === "LEFT");
        const nextDirection = opposite ? direction : queuedDirection;
        const delta = directions[nextDirection];
        const nextHead = { x: head.x + delta.x, y: head.y + delta.y };

        setDirection(nextDirection);

        const outOfBounds =
          nextHead.x < 0 ||
          nextHead.x >= BOARD_SIZE ||
          nextHead.y < 0 ||
          nextHead.y >= BOARD_SIZE;

        const bodyHit = prevSnake.some((part, idx) => {
          const ignoreTail = !sameCell(nextHead, food) && idx === 0;
          return !ignoreTail && sameCell(part, nextHead);
        });

        if (outOfBounds || bodyHit) {
          setRunning(false);
          setGameOver(true);
          return prevSnake;
        }

        const ateFood = sameCell(nextHead, food);
        const moved = ateFood
          ? [...prevSnake, nextHead]
          : [...prevSnake.slice(1), nextHead];

        if (ateFood) {
          setScore((value) => {
            const nextScore = value + 1;
            setBest((oldBest) => Math.max(oldBest, nextScore));
            return nextScore;
          });
          setFood(randomFood(moved));
        }

        return moved;
      });
    }, TICK_MS);

    return () => clearInterval(interval);
  }, [direction, food, gameOver, queuedDirection, running]);

  const resetGame = () => {
    const freshSnake = initialSnake();
    setSnake(freshSnake);
    setDirection("RIGHT");
    setQueuedDirection("RIGHT");
    setFood(randomFood(freshSnake));
    setScore(0);
    setGameOver(false);
    setRunning(true);
  };

  const boardCells = Array.from({ length: BOARD_SIZE * BOARD_SIZE }, (_, i) => ({
    x: i % BOARD_SIZE,
    y: Math.floor(i / BOARD_SIZE)
  }));

  const mobileTurn = (next: Direction) => {
    setQueuedDirection(next);
  };

  return (
    <Card className="w-full max-w-3xl border-white/10 bg-black/30">
      <CardHeader>
        <CardTitle className="text-balance bg-gradient-to-r from-lime-300 via-teal-300 to-cyan-300 bg-clip-text text-transparent">
          Neon Snake Arena
        </CardTitle>
        <CardDescription>
          Arrow keys or WASD to move. Eat fruit, avoid walls and your tail.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex gap-2 text-sm">
            <p className="rounded-md border border-border/70 bg-background/40 px-3 py-1">
              Score: <span className="font-semibold">{score}</span>
            </p>
            <p className="rounded-md border border-border/70 bg-background/40 px-3 py-1">
              Best: <span className="font-semibold">{best}</span>
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setRunning((value) => !value)}
              disabled={gameOver}
            >
              {running ? <Pause size={16} /> : <Play size={16} />}
              {running ? "Pause" : "Resume"}
            </Button>
            <Button variant="outline" size="sm" onClick={resetGame}>
              <RotateCcw size={16} />
              Restart
            </Button>
          </div>
        </div>

        <div className="relative rounded-xl border border-border/60 bg-gradient-to-b from-cyan-500/10 to-lime-500/10 p-3">
          <div
            className="grid gap-1"
            style={{
              gridTemplateColumns: `repeat(${BOARD_SIZE}, minmax(0, 1fr))`
            }}
          >
            {boardCells.map((cell) => {
              const key = `${cell.x}-${cell.y}`;
              const index = snakeMap.get(key);
              const isSnake = index !== undefined;
              const isHead = index === snake.length - 1;
              const isFood = sameCell(cell, food);

              return (
                <motion.div
                  key={key}
                  layout
                  transition={{ type: "spring", stiffness: 280, damping: 24 }}
                  className={cn(
                    "aspect-square rounded-[4px]",
                    isSnake
                      ? isHead
                        ? "bg-cyan-300 shadow-[0_0_12px_rgba(103,232,249,0.85)]"
                        : "bg-lime-300/90"
                      : "bg-white/[0.03]"
                  )}
                >
                  {isFood ? (
                    <motion.div
                      className="h-full w-full rounded-[4px] bg-rose-300 shadow-[0_0_12px_rgba(253,164,175,0.9)]"
                      animate={{ scale: [1, 1.15, 1] }}
                      transition={{ duration: 0.9, repeat: Number.POSITIVE_INFINITY }}
                    />
                  ) : null}
                </motion.div>
              );
            })}
          </div>

          {gameOver ? (
            <motion.div
              className="absolute inset-0 grid place-items-center rounded-xl bg-black/70 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="text-center">
                <p className="text-2xl font-bold text-white">Game Over</p>
                <p className="mb-3 text-sm text-zinc-300">Final score: {score}</p>
                <Button onClick={resetGame}>Play Again</Button>
              </div>
            </motion.div>
          ) : null}
        </div>

        <div className="mx-auto grid w-full max-w-[220px] grid-cols-3 gap-2 sm:hidden">
          <div />
          <Button
            variant="outline"
            size="icon"
            className="h-14 w-14 touch-manipulation rounded-xl border-white/20 bg-white/5 text-white active:scale-95"
            onPointerDown={(event) => {
              event.preventDefault();
              mobileTurn("UP");
            }}
          >
            <ArrowUp size={20} />
          </Button>
          <div />
          <Button
            variant="outline"
            size="icon"
            className="h-14 w-14 touch-manipulation rounded-xl border-white/20 bg-white/5 text-white active:scale-95"
            onPointerDown={(event) => {
              event.preventDefault();
              mobileTurn("LEFT");
            }}
          >
            <ArrowLeft size={20} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-14 w-14 touch-manipulation rounded-xl border-white/20 bg-white/5 text-white active:scale-95"
            onPointerDown={(event) => {
              event.preventDefault();
              mobileTurn("DOWN");
            }}
          >
            <ArrowDown size={20} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-14 w-14 touch-manipulation rounded-xl border-white/20 bg-white/5 text-white active:scale-95"
            onPointerDown={(event) => {
              event.preventDefault();
              mobileTurn("RIGHT");
            }}
          >
            <ArrowRight size={20} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
