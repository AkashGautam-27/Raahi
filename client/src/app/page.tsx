import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
import PublicHome from "@/components/PublicHome";
import PartnerDashboard from "@/components/PartnerDashboard";
import AdminDashboard from "@/components/AdminDashboard";
import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/user.model";
import GeoUpdater from "@/components/GeoUpdater";

export default async function Home() {
  const session = await auth();

  let user = null;
  if (session?.user?.email) {
    await connectDb();
    user = await User.findOne({ email: session.user.email });
  }

  const role = user?.role || (session?.user as any)?.role;

  if (role === "admin") {
    return <AdminDashboard />;
  }

  return (
    <div className="w-full min-h-screen bg-white">
      <GeoUpdater userId={user?._id?.toString() ?? ""} />
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

