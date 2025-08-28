import { Search, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import scriptumLogo from "@assets/Scriptum-logo_1756408112211.png";

export function TopBar() {
  const { user, logout } = useAuth();

  return (
    <div className="w-full bg-gradient-to-r from-blue-600 to-blue-400 text-white shadow-lg">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Left side - Logo and Scriptum Learning */}
        <div className="flex items-center space-x-1">
          <img 
            src={scriptumLogo} 
            alt="Scriptum Logo" 
            className="w-8 h-8"
            data-testid="img-scriptum-logo"
          />
          <span 
            className="text-lg text-white" 
            style={{ 
              paddingLeft: '3.5px',
              fontFamily: "'Tangerine', cursive",
              fontWeight: 700
            }}
            data-testid="text-scriptum-learning"
          >
            Scriptum Learning
          </span>
        </div>
        
        {/* Center - Search */}
        <div className="flex-1 flex justify-center px-8">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-200" />
            <Input
              type="text"
              placeholder="Search courses, content, standards..."
              className="w-full pl-10 bg-blue-500/30 border-blue-300/30 text-white focus:bg-blue-500/20 focus:border-blue-200 search-placeholder"
              data-testid="input-search"
            />
          </div>
        </div>

        {/* Right side - User info and logout */}
        <div className="flex items-center space-x-6">
          {/* User Info */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-sm" data-testid="text-user-initials">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </span>
            </div>
            <div className="text-right">
              <p className="font-medium text-sm text-white" data-testid="text-user-name">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-blue-100 capitalize" data-testid="text-user-role">
                {user?.role?.replace("_", " ")}
              </p>
            </div>
          </div>

          {/* Active Session Badge */}
          <Badge className="bg-green-500/20 text-green-100 border-green-400/30">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
            Active Session
          </Badge>

          {/* Logout Button */}
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/10 hover:text-white"
            onClick={logout}
            data-testid="button-logout"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}