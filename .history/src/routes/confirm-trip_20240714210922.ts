import "dayjs/locale/pt-br";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { dayjs } from "../lib/dayjs";
import { prisma } from "../lib/prisma";
import { getMailClient } from "../lib/mail";

export async function confirmTrip(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/trips/:tripId/confirm",
    {
      schema: {
        params: z.object({
          tripId: z.string().uuid(),
        }),
      },
    },
    async (request, reply) => {
      const { tripId } = request.params;
      const trip = await prisma.trip.findUnique({
        where: { id: tripId },
        include: { participants: { where: { is_owner: false } } },
      });

      if (!trip) {
        throw new Error("Trip not found");
      }

      if (trip.is_confirmed) {
        return reply.redirect(`http://localhost:3000/trips/${tripId}`);
      }

      await prisma.trip.update({
        where: { id: tripId },
        data: { is_confirmed: true },
      });

      const formattedStartDate = dayjs(trip.starts_at).format("LL");
      const formattedEndDate = dayjs(trip.ends_at).format("LL");

      const participants = await prisma.participant.findMany({
        where: { trip_idd: tripId, is_owner: false },
      });

      const confirmationLink = `http://localhost:3333/trips/${trip.id}/confirm/ID-DO-PARTICIPANTE`;

      const mail = await getMailClient();

      return { tripId: request.params.tripId };
    }
  );
}
