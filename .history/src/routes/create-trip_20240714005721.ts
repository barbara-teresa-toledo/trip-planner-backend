import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import dayjs from "dayjs";
import { z } from "zod";
import { prisma } from "../lib/prisma";

export async function createTrip(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/trips",
    {
      schema: {
        body: z.object({
          destination: z.string().min(4),
          starts_at: z.coerce.date(),
          ends_at: z.coerce.date(),
          owner_name: z.string(),
          owner_email: z.string().email(),
        }),
      },
    },
    async (request) => {
      const { destination, starts_at, ends_at } = request.body;

      if (dayjs(starts_at).isBefore(new Date())) {
        throw new Error("Data inicial inválida");
      }

      if (dayjs(ends_at).isBefore(starts_at)) {
        throw new Error("Data final inválida");
      }

      const trip = await prisma.trip.create({
        data: { destination, starts_at, ends_at },
      });

      return { tripId: trip.id };
    }
  );
}
