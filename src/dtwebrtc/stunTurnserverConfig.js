let config = {
            // automatic accept all invitations
            autoAccept: true,

            // location of the identity provider
            idp: 'webfinger', // default value (search for identities with webfinger)

            // default ice servers
            ice: [{
              urls: 'stun:stun.voiparound.com'
            }, {
              urls: 'stun:stun.voipbuster.com'
            }, {
              urls: 'stun:stun.voipstunt.com'
            }, {
              urls: 'stun:stun.voxgratia.org'
            }, {
              urls: 'stun:stun.ekiga.net'
            }, {
              urls: 'stun:stun.schlund.de'
            }, {
              urls: 'stun:stun.iptel.org'
            }, {
              urls: 'stun:stun.l.google.com:19302'
            }, {
              urls: 'stun:stun1.l.google.com:19302'
            }, {
              urls: 'stun:stun.ideasip.com'
            }, {
              urls: 'stun:stun4.l.google.com:19302'
            }, {
              urls: 'stun:stun2.l.google.com:19302'
            }, {
              urls: 'stun:stun3.l.google.com:19302'
            }, {
              urls: 'turn:192.158.29.39:3478?transport=tcp',
              credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
              username: '28224511:1379330808'
            }, {
              urls: 'turn:192.158.29.39:3478?transport=udp',
              credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
              username: '28224511:1379330808'
            }, {
              urls: 'turn:numb.viagenie.ca',
              credential: 'muazkh',
              username: 'webrtc@live.com'
            }]
          };

export default config;