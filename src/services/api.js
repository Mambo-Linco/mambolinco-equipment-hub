// This file would normally contain actual API calls
// For this example, we'll use mock data

export const fetchEquipmentData = async () => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Return mock data
  return [
    {
      inStock: ">",
      id: "EQ001",
      name: "Dell Laptop XPS 15",
      category: "Electronics",
      serialNumber: "P849FEILWO0",
      status: "Available",
      location: "Office 101",
      value: "Munyowani",
      powerVoltage: "78.3",
      voltage: "23.1",
      lastUpdated: "2024-01-15",
    },
    {
      inStock: ">",
      id: "EQ002",
      name: "Projector HD-4K",
      category: "Audio/Visual",
      serialNumber: "P849FEILWO0",
      status: "Borrowed",
      location: "Meeting Room A",
      value: "Munyowani",
      powerVoltage: "78.3",
      voltage: "23.1",
      lastUpdated: "2024-01-14",
    },
    {
      inStock: ">",
      id: "EQ003",
      name: "Digital Camera",
      category: "Photography",
      serialNumber: "P849FEILWO0",
      status: "Rented",
      location: "Studio 3",
      value: "Munyowani",
      powerVoltage: "78.3",
      voltage: "23.1",
      lastUpdated: "2024-01-13",
    },
    {
      inStock: ">",
      id: "EQ004",
      name: "Conference Phone",
      category: "Electronics",
      serialNumber: "P849FEILWO0",
      status: "Available",
      location: "Office 202",
      value: "Munyowani",
      powerVoltage: "78.3",
      voltage: "23.1",
      lastUpdated: "2024-01-12",
    },
    {
      inStock: ">",
      id: "EQ005",
      name: "Drone DJI Air",
      category: "Photography",
      serialNumber: "P849FEILWO0",
      status: "Borrowed",
      location: "Field Unit",
      value: "Munyowani",
      powerVoltage: "78.3",
      voltage: "23.1",
      lastUpdated: "2024-01-11",
    },
  ];
};
