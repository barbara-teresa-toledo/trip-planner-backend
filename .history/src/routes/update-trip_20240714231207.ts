import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import nodemailer from "nodemailer";
import { z } from "zod";
import { dayjs } from "../lib/dayjs";
import { getMailClient } from "../lib/mail";
import { prisma } from "../lib/prisma";

export async function updateTrip(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().put(
    "/trips/:tripId",
    {
      schema: {
        params: z.object({ tripId: z.string().uuid() }),
        body: z.object({
          destination: z.string().min(4),
          starts_at: z.coerce.date(),
          ends_at: z.coerce.date(),
        }),
      },
    },
    async (request) => {
      const { trip } = request.params;
      const { destination, starts_at, ends_at } = request.body;

      const trip = await prisma.trip.findUnique({
        where: { id: tripId },
      });

      if (!trip) {
        throw new Error("Trip not found");
      }

      if (dayjs(starts_at).isBefore(new Date())) {
        throw new Error("Invalid start date");
      }

      if (dayjs(ends_at).isBefore(starts_at)) {
        throw new Error("Invalid end date");
      }

      const trip = await prisma.trip.create({
        data: {
          destination,
          starts_at,
          ends_at,
          participants: {
            createMany: {
              data: [
                {
                  name: owner_name,
                  email: owner_email,
                  is_owner: true,
                  is_confirmed: true,
                },
                ...emails_to_invite.map((email) => {
                  return { email };
                }),
              ],
            },
          },
        },
      });

      const formattedStartDate = dayjs(starts_at).format("LL");
      const formattedEndDate = dayjs(ends_at).format("LL");

      const confirmationLink = `http://localhost:3333/trips/${trip.id}/confirm`;

      const mail = await getMailClient();

      const message = await mail.sendMail({
        from: { name: "Equipe plann.er", address: "teste@plann.er" },
        to: { name: owner_name, address: owner_email },
        subject: `Confirme sua viagem para ${destination} em ${formattedStartDate}`,
        html: `<div style="font-family: sans-serif; font-size: 16px; line-height: 1.6;">
                <p>Você solicitou a criação de uma viagem para <strong>${destination}</strong> nas datas de <strong>${formattedStartDate}</strong> até <strong>${formattedEndDate}</strong>. </p>
                <p></p>
                <p>Para confirmar sua viagem, clique no link abaixo:</p>
                <p></p>
                <p>
                  <a href="${confirmationLink}">Confirmar viagem</a>
                </p>
                <p></p>
                <p>Caso você não saiba do que se trata esse email, basta ignorá-lo.</p>
              </div>
              `.trim(),
      });

      console.log(nodemailer.getTestMessageUrl(message));

      return { tripId: trip.id };
    }
  );
}
