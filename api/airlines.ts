import { prisma } from "@/lib/db";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const airlineId = req.query.id;

    const airlines = await prisma.airline.findMany({
      include: { airlineAirport: true },
    });
    res.json(airlines);
  }

  if (req.method === "POST") {
    const { name, airportIds } = req.body;
    const airportIdArray = airportIds.map((id: string) => parseInt(id));

    const airline = await prisma.airline.create({
      data: {
        name,
        airlineAirport: {
          createMany: {
            data: airportIdArray.map((id: bigint) => ({ airportId: id })),
          },
        },
      },
      include: {
        airlineAirport: true,
      },
    });

    res.status(201).json(airline);
  }
}
