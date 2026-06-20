import createApp from '@/lib/create-app'
import index from '@/routes/index.route'
import auth from '@/routes/auth/auth.index'
import users from "@/routes/users/users.index";
import fuels from "@/routes/fuels/fuels.index";
import stations from "@/routes/stations/stations.index";
import prices from "@/routes/prices/prices.index";

const app = createApp()

const routes = [
  index,
  auth,
  users,
  fuels,
  stations,
  prices,
] as const;

routes.forEach((route) => {
  app.route('/', route)
})

export default app