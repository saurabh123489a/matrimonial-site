import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Fetch user data from your API
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050/api';
    const userResponse = await fetch(`${apiUrl}/users/${id}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    let userData: any = null;
    if (userResponse.ok) {
      const result = await userResponse.json();
      userData = result.data;
    }

    const userName = userData?.name || 'Profile';
    const userAge = userData?.age ? `${userData.age} years` : '';
    const userCity = userData?.city || '';
    const userState = userData?.state || '';
    const userPhoto = userData?.photos?.find((p: any) => p.isPrimary)?.url || 
                      userData?.photos?.[0]?.url || 
                      null;

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#ec4899',
            backgroundImage: 'linear-gradient(to bottom right, #ec4899, #dc2626, #ec4899)',
            position: 'relative',
          }}
        >
          {/* Background Pattern */}
          <div
            style={{
              position: 'absolute',
              top: -100,
              left: -100,
              width: 400,
              height: 400,
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: -150,
              right: -150,
              width: 500,
              height: 500,
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            }}
          />

          {/* Content */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              zIndex: 1,
              padding: '40px',
            }}
          >
            {/* Logo */}
            <div
              style={{
                fontSize: 48,
                fontWeight: 'bold',
                color: 'white',
                marginBottom: 20,
              }}
            >
              💍 ekGahoi
            </div>

            {/* Profile Photo */}
            {userPhoto ? (
              <img
                src={userPhoto}
                alt={userName}
                width={200}
                height={200}
                style={{
                  borderRadius: '50%',
                  border: '8px solid white',
                  marginBottom: 30,
                  objectFit: 'cover',
                }}
              />
            ) : (
              <div
                style={{
                  width: 200,
                  height: 200,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  border: '8px solid white',
                  marginBottom: 30,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 80,
                }}
              >
                👤
              </div>
            )}

            {/* Name */}
            <div
              style={{
                fontSize: 56,
                fontWeight: 'bold',
                color: 'white',
                marginBottom: 10,
                textAlign: 'center',
              }}
            >
              {userName}
            </div>

            {/* Details */}
            <div
              style={{
                fontSize: 32,
                color: 'rgba(255, 255, 255, 0.9)',
                textAlign: 'center',
                marginBottom: 20,
              }}
            >
              {userAge && `${userAge}${userCity ? ' • ' : ''}`}
              {userCity && userState ? `${userCity}, ${userState}` : userCity || userState}
            </div>

            {/* Footer */}
            <div
              style={{
                fontSize: 24,
                color: 'rgba(255, 255, 255, 0.8)',
                marginTop: 40,
              }}
            >
              Visit ekGahoi to connect
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error('Error generating OG image:', error);
    
    // Return a default image
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#ec4899',
            backgroundImage: 'linear-gradient(to bottom right, #ec4899, #dc2626)',
          }}
        >
          <div style={{ fontSize: 64, fontWeight: 'bold', color: 'white', marginBottom: 20 }}>
            💍 ekGahoi
          </div>
          <div style={{ fontSize: 32, color: 'white' }}>Your Trusted Matrimonial Platform</div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  }
}

