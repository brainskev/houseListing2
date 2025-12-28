export interface Enquiry {
  _id: string;
  userId: string;
  name: string;
  propertyId?: string;
  phone: string;
  message: string;
  status: "new" | "contacted" | "closed";
  createdAt: string;
  updatedAt?: string;
}

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
