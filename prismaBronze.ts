// This file should be moved to: dcx-cloud-backend-unified/src/utils/prisma/prismaBronze.ts

import { PrismaClient } from '../../generated/client-bronze/index.js'

const prismaBronze = new PrismaClient()

export default prismaBronze