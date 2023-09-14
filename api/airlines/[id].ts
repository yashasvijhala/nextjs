import { prisma } from "@/lib/db";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const airlineId = parseInt(req.query.id as string);

  if (req.method === "GET") {
    try {
      const airline = await prisma.airline.findUnique({
        where: {
          id: airlineId,
        },
        include: { airlineAirport: true },
      });

      if (airline) {
        res.json(airline);
      } else {
        res.status(404).json({ error: "Airline not found." });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error." });
    }
  } else if (req.method === "PATCH") {
    const { name, airportIds } = req.body;

    try {
     
      const updatedAirline = await prisma.airline.update({
         
        where: {
          id: airlineId,
        },
        data: {
          name, 
          airlineAirport: {
           
            deleteMany: {}, 
            create: airportIds.split(',').map((id: string) => ({
              airportId: parseInt(id.trim()),
            })),
          },
        },
        include: { airlineAirport: true },
      });

      res.json(updatedAirline);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error." });
    }
  } else if (req.method === "DELETE") {
    try {
     
      const airlineAirports = await prisma.airlineAirport.findMany({
        where: {
          airlineId: airlineId,
        },
      });

      for (const airlineAirport of airlineAirports) {
        await prisma.airlineAirport.delete({
          where: {
            id: airlineAirport.id,
          },
        });
      }

    
      await prisma.airline.delete({
        where: {
          id: airlineId,
        },
      });

      res.status(204).end();
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error." });
    }
  } 
  
}
