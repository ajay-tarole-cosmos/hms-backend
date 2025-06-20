const { Reservation, Room, GuestDetail, Guests } = require('../models');
const { Op } = require('sequelize');

class UpcomingBookingsReport {
    static async generateReport(daysAhead = 30) {
        try {console.log("ebtere sdfds")
            const startDate = new Date();
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + daysAhead);

            const bookings = await Reservation.findAll({
                include: [
                    // {
                    //     model: Room,
                    //     // attributes: ['room_number', 'room_type']
                    // },
                    {
                        model: Guests,
                        as:'guest'
                        // attributes: ['first_name', 'last_name', 'email', 'phone']
                    }
                ],
                where: {
                    check_in_date_time: {
                        [Op.between]: [startDate, endDate]
                    }
                },
                order: [['check_in_date_time', 'ASC']]
            });

            console.log(bookings,daysAhead)
            const reportData = bookings.map(booking => {
                const status = this.getBookingStatus(booking);
                return {
                    booking_id: booking.id,
                    guest_name: `${booking.guest.first_name} ${booking.guest.last_name}`,
                    guest_contact: {
                        email: booking.guest.email,
                        phone: booking.guest.phone
                    },
                    // room: {
                    //     number: booking.Room.room_number,
                    //     type: booking.Room.room_type
                    // },
                    // check_in: booking.check_in,
                    // check_out: booking.check_out,
                    status: status.status,
                    color_code: status.color,
                    special_requests: booking.special_requests,
                    booking_source: booking.booking_source,
                    total_amount: booking.total_amount
                };
            });

            return {
                success: true,
                data:bookings
                //  {
                //     bookings: bookings,
                //     summary: {
                //         total_bookings: reportData.length,
                //         // by_status: this.getStatusSummary(reportData),
                //         // by_room_type: this.getRoomTypeSummary(reportData)
                //     }
                // }
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    static getBookingStatus(booking) {
        const now = new Date();
        const checkIn = new Date(booking.check_in);
        const checkOut = new Date(booking.check_out);
        const daysUntilCheckIn = Math.ceil((checkIn - now) / (1000 * 60 * 60 * 24));

        if (daysUntilCheckIn < 0) {
            return { status: 'Checked In', color: '#4CAF50' }; // Green
        } else if (daysUntilCheckIn === 0) {
            return { status: 'Arriving Today', color: '#FFC107' }; // Yellow
        } else if (daysUntilCheckIn <= 2) {
            return { status: 'Arriving Soon', color: '#FF9800' }; // Orange
        } else if (daysUntilCheckIn <= 7) {
            return { status: 'Upcoming', color: '#2196F3' }; // Blue
        } else {
            return { status: 'Future', color: '#9E9E9E' }; // Grey
        }
    }

    static getStatusSummary(bookings) {
        return bookings.reduce((summary, booking) => {
            summary[booking.status] = (summary[booking.status] || 0) + 1;
            return summary;
        }, {});
    }

    static getRoomTypeSummary(bookings) {
        return bookings.reduce((summary, booking) => {
            const roomType = booking.room.type;
            summary[roomType] = (summary[roomType] || 0) + 1;
            return summary;
        }, {});
    }
}

module.exports = UpcomingBookingsReport; 