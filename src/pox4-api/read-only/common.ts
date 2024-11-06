import type { OptionalCV, TupleCV, BufferCV } from "@stacks/transactions";

export type PoxAddr = OptionalCV<
  TupleCV<{ version: BufferCV; hashbytes: BufferCV }>
>;
