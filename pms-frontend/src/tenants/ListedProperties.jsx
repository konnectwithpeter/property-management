import { useState } from "react";
import PropertyCard from "../components/dashboard/PropertyCard";

export default function ListedProperties({ properties }) {
  return (
    <main
      className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6"
      style={{ minWidth: "98.5vw", width: "100%", padding: "1rem" }}
    >
      <div className="grid grid-cols-4 gap-4">
        {properties.map((property, index) => (
          <div key={index}>
            <PropertyCard property={property} index={index} />
          </div>
        ))}
      </div>
    </main>
  );
}
