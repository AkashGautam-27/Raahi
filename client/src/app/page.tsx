import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
import PublicHome from "@/components/PublicHome";
import PartnerDashboard from "@/components/PartnerDashboard";
import AdminDashboard from "@/components/AdminDashboard";
import { auth } from "@/auth";
import connectDB from "@/lib/db";
import User from "@/models/user.model";

export default async function Home() {
  const session = await auth();

  let user = null;
  if (session?.user?.email) {
    await connectDB();
    user = await User.findOne({ email: session.user.email });
  }

  const role = user?.role || (session?.user as any)?.role;

  if (role === "admin") {
    return <AdminDashboard />;
  }

  return (
    <div className="w-full min-h-screen bg-white">
      <Nav />
      {role === "partner" ? (
        <PartnerDashboard />
      ) : (
        <PublicHome />
      )}
      <Footer />
    </div>
  );
}

