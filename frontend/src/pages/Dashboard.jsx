import { motion } from "framer-motion";
import { useAuth } from "../auth/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8">
      <h1 className="text-2xl font-bold">
        Bienvenido {user?.nombre}
      </h1>
    </motion.div>
  );
}
