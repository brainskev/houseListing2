export interface ViewingAppointment {
  _id: string;
  userId: string;
  name: string;
  phone: string;
  propertyId: string;
  date: string;
  status: "pending" | "confirmed" | "completed";
  createdAt: string;
  updatedAt?: string;
}
