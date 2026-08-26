import { z } from "zod";

const httpsUrl = z.string().refine((val) => val.startsWith("https://"), {
  message: "Nur HTTPS-URLs sind erlaubt.",
});

const introOutroSchema = z.object({
  text: z.string().min(1, "Text darf nicht leer sein."),
  mediaUrl: httpsUrl.optional(),
  mediaType: z.enum(["image", "audio", "video"]).optional(),
}).refine(
  (data) => !data.mediaUrl || data.mediaType,
  { message: "mediaType ist erforderlich wenn mediaUrl gesetzt ist." }
);

const textModule = z.object({
  type: z.literal("text"),
  content: z.string().min(1, "Text-Inhalt darf nicht leer sein."),
});

const imageModule = z.object({
  type: z.literal("image"),
  url: httpsUrl,
  caption: z.string().optional(),
});

const audioModule = z.object({
  type: z.literal("audio"),
  url: httpsUrl,
  caption: z.string().optional(),
});

const videoModule = z.object({
  type: z.literal("video"),
  url: httpsUrl,
  caption: z.string().optional(),
});

const codeTask = z.object({
  type: z.literal("task"),
  taskType: z.literal("code"),
  question: z.string().min(1, "Frage darf nicht leer sein."),
  answer: z.string().min(1, "Antwort darf nicht leer sein."),
});

const multipleChoiceTask = z.object({
  type: z.literal("task"),
  taskType: z.literal("multiple-choice"),
  question: z.string().min(1, "Frage darf nicht leer sein."),
  options: z.array(z.string().min(1)).min(2).max(5),
  correctIndex: z.number().int().min(0).optional(),
  correctIndices: z.array(z.number().int().min(0)).min(1).optional(),
}).transform((data) => {
  const indices = data.correctIndices ?? (data.correctIndex !== undefined ? [data.correctIndex] : [0]);
  return { ...data, correctIndices: indices };
}).pipe(z.object({
  type: z.literal("task"),
  taskType: z.literal("multiple-choice"),
  question: z.string(),
  options: z.array(z.string()),
  correctIndex: z.number().optional(),
  correctIndices: z.array(z.number()),
}).refine(
  (data) => data.correctIndices.every(i => i < data.options.length),
  { message: "correctIndices müssen auf gültige Optionen zeigen." }
));

const sortingTask = z.object({
  type: z.literal("task"),
  taskType: z.literal("sorting"),
  question: z.string().min(1, "Frage darf nicht leer sein."),
  items: z.array(z.string().min(1)).min(3).max(6),
});

const taskModule = z.discriminatedUnion("taskType", [
  codeTask,
  multipleChoiceTask,
  sortingTask,
]);

const moduleSchema = z.union([
  textModule,
  imageModule,
  audioModule,
  videoModule,
  taskModule,
]);

const stationSchema = z.object({
  id: z.string().uuid("Stations-ID muss eine gültige UUID sein."),
  name: z.string().min(1, "Station braucht einen Namen."),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  radiusMeters: z.number().min(10).max(100).default(10),
  modules: z.array(moduleSchema).min(1, "Station braucht mindestens ein Modul.").max(20, "Maximal 20 Module pro Station."),
});

export const questSchema = z.object({
  version: z.number(),
  id: z.string().uuid("Quest-ID muss eine gültige UUID sein."),
  name: z.string().min(1, "Die Quest hat keinen Namen."),
  description: z.string().optional(),
  author: z.string().optional(),
  lastModified: z.string().datetime({ message: "lastModified muss ein gültiges ISO-Datum sein." }),
  estimatedDuration: z.string().optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
  intro: introOutroSchema,
  outro: introOutroSchema,
  stations: z.array(stationSchema).min(1, "Die Quest braucht mindestens eine Station.").max(20, "Maximal 20 Stationen."),
});

export type Quest = z.infer<typeof questSchema>;
export type Station = z.infer<typeof stationSchema>;
export type Module = z.infer<typeof moduleSchema>;
