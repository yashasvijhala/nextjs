import { useState, useEffect, ChangeEvent } from "react";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient(); 

interface Airline {
  id: number;
  name: string;
}

function Home() {
  const [airlines, setAirlines] = useState<Airline[]>([]);
  const [newAirlineName, setNewAirlineName] = useState<string>("");
  const [newAirportIds, setNewAirportIds] = useState<string>("");
  const [searchAirlineId, setSearchAirlineId] = useState<string>("");
  const [searchedAirline, setSearchedAirline] = useState<Airline | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [updateAirlineId, setUpdateAirlineId] = useState<string>("");
  const [updateAirlineName, setUpdateAirlineName] = useState<string>("");
  const [updateAirportIds, setUpdateAirportIds] = useState<string>("");

  useEffect(() => {
    fetch('/api/airlines')
      .then((response) => response.json())
      .then((data: Airline[]) => setAirlines(data))
      .catch((error) => setError(error));
  }, []);

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNewAirlineName(e.target.value);
  };

  const handleAirportIdsChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNewAirportIds(e.target.value);
  };

  const handleSubmit = () => {
    const airportIdsArray = newAirportIds.split(',').map((id) => id.trim());

    fetch('/api/airlines', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: newAirlineName,
        airportIds: airportIdsArray,
      }),
    })
      .then((response) => {
        if (response.status === 201) {
          return response.json();
        } else {
          throw new Error('Error creating airline.');
        }
      })
      .then((data: Airline) => {
        setAirlines([...airlines, data]);
        setNewAirlineName("");
        setNewAirportIds("");
      })
      .catch((error) => {
        setError(error);
      });
  };

  const handleSearchIdChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchAirlineId(e.target.value);
  };

  const handleSearch = () => {
    const airlineId = parseInt(searchAirlineId);
     
    if (!isNaN(airlineId)) {
    
      fetch(`/api/airlines/${airlineId}`, {
        method: 'GET',
      })
        .then((response) => {
          if (response.status === 200) {
            return response.json();
          } else if (response.status === 404) {
            setError(new Error('Airline not found.'));
            setSearchedAirline(null);
          } else {
            throw new Error('Error fetching airline details.');
          }
        })
        .then((data: Airline) => {
          setSearchedAirline(data);
          setError(null);
        })
        .catch((error) => {
          setError(error);
          setSearchedAirline(null);
        });
    } else {
      setError(new Error('Invalid airline ID.'));
      setSearchedAirline(null);
    }
  };

  const handleDelete = () => {
    const airlineId = parseInt(searchAirlineId);
  
    if (!isNaN(airlineId)) {
      
      console.log("Deleting airline with ID:", airlineId);
  
      fetch(`/api/airlines/${airlineId}`, {
        method: 'DELETE',
      })
        .then((response) => {
          if (response.status === 204) {
           
            setAirlines(airlines.filter((airline) => airline.id !== airlineId));
            setSearchedAirline(null);
            setSearchAirlineId("");
          } else if (response.status === 404) {
            setError(new Error('Airline not found.'));
            setSearchedAirline(null);
          } else {
            throw new Error('Error deleting airline.');
          }
        })
        .catch((error) => {
          setError(error);
        });
    } else {
      setError(new Error('Invalid airline ID.'));
      setSearchedAirline(null);
    }
  };

  const handleUpdate = () => {
    const airlineId = parseInt(updateAirlineId);
    const airportIdsArray = updateAirportIds.split(',').map((id) => id.trim()).join(',');
  
    fetch(`/api/airlines/${airlineId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: updateAirlineName,
        airportIds: airportIdsArray,
      }),
    })
      .then((response) => {
        if (response.status === 200) {
          return response.json();
        }
      })
  };
  
  

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-2xl font-semibold mb-4">Airlines</h1>
      {error ? <p className="text-red-500">Error: {error.message}</p> : null}
      <ul className="list-disc pl-4">
        {airlines.map((airline) => (
          <li key={airline.id} className="text-gray-700">{airline.name}</li>
        ))}
      </ul>
      <form className="mt-8">
        <div className="mb-4">
          <label htmlFor="newAirlineName" className="block text-gray-700">Airline Name:</label>
          <input
            type="text"
            id="newAirlineName"
            name="newAirlineName"
            value={newAirlineName}
            onChange={handleNameChange}
            required
            className="border border-gray-300 rounded px-3 py-2 w-full text-black"
            placeholder="Enter airline name" 
          />
        </div>
        <div className="mb-4">
          <label htmlFor="newAirportIds" className="block text-gray-700">Airport IDs (comma-separated):</label>
          <input
            type="text"
            id="newAirportIds"
            name="newAirportIds"
            value={newAirportIds}
            onChange={handleAirportIdsChange}
            required
            className="border border-gray-300 rounded px-3 py-2 w-full text-black"
            placeholder="Enter airport IDs (comma-separated)" 
          />
        </div>
        <button
          type="button"
          onClick={handleSubmit}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Create Airline
        </button>
      </form>
      <div className="mt-8">
        <label htmlFor="searchAirlineId" className="block text-gray-700">Search/Delete Airline by ID:</label>
        <div className="flex">
          <input
            type="text"
            id="searchAirlineId"
            name="searchAirlineId"
            value={searchAirlineId}
            onChange={handleSearchIdChange}
            className="border border-gray-300 rounded px-3 py-2 w-full text-black mr-2"
            placeholder="Enter airline ID" 
          />
          <button
            type="button"
            onClick={handleSearch}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Search
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>
      {searchedAirline ? (
        <div className="mt-8">
          <h2 className="text-xl font-semibold">Searched Airline Details:</h2>
          <p>ID: {searchedAirline.id}</p>
          <p>Name: {searchedAirline.name}</p>
        </div>
      ) : null}
       
       <div className="mt-8">
        <label htmlFor="updateAirlineId" className="block text-gray-700">Update Airline by ID:</label>
        <div className="flex">
          <input
            type="text"
            id="updateAirlineId"
            name="updateAirlineId"
            value={updateAirlineId}
            onChange={(e) => setUpdateAirlineId(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 w-full text-black mr-2"
            placeholder="Enter airline ID" 
          />
          <input
            type="text"
            id="updateAirlineName"
            name="updateAirlineName"
            value={updateAirlineName}
            onChange={(e) => setUpdateAirlineName(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 w-full text-black mr-2"
            placeholder="Enter updated airline name" 
          />
          <input
            type="text"
            id="updateAirportIds"
            name="updateAirportIds"
            value={updateAirportIds}
            onChange={(e) => setUpdateAirportIds(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 w-full text-black mr-2"
            placeholder="Enter updated airport IDs (comma-separated)" 
          />
          <button
            type="button"
            onClick={handleUpdate}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Update
          </button>
        </div>
      </div>
    </main>
  );
}

export default Home;

