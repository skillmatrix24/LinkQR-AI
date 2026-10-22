#!/bin/bash
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -print0 | xargs -0 sed -i 's/import Link from "next\/link"/import { Link } from "react-router-dom"/g'
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -print0 | xargs -0 sed -i "s/import Link from 'next\/link'/import { Link } from 'react-router-dom'/g"
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -print0 | xargs -0 sed -i 's/href="/to="/g'
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -print0 | xargs -0 sed -i 's/href={/to={/g'
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -print0 | xargs -0 sed -i 's/from "next\/navigation"/from "react-router-dom"/g'
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -print0 | xargs -0 sed -i "s/from 'next\/navigation'/from 'react-router-dom'/g"
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -print0 | xargs -0 sed -i 's/useRouter()/useNavigate()/g'
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -print0 | xargs -0 sed -i 's/router.push(/navigate(/g'
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -print0 | xargs -0 sed -i 's/usePathname()/useLocation().pathname/g'
