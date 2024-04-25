import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import { Appointment } from "../models/appointmentSchema.js";
import { User } from "../models/userSchema.js";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "Gmail", // You can change to other email services or custom SMTP
  auth: {
    user: "", // Your email address
    pass: "", // Your email password
  },
});
export const postAppointment = catchAsyncErrors(async (req, res, next) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    nic,
    dob,
    gender,
    appointment_date,
    department,
    doctor_firstName,
    doctor_lastName,
    hasVisited,
    address,
  } = req.body;
  if (
    !firstName ||
    !lastName ||
    !email ||
    !phone ||
    !nic ||
    !dob ||
    !gender ||
    !appointment_date ||
    !department ||
    !doctor_firstName ||
    !doctor_lastName ||
    !address
  ) {
    return next(new ErrorHandler("Please Fill Full Form!", 400));
  }
  const isConflict = await User.find({
    firstName: doctor_firstName,
    lastName: doctor_lastName,
    role: "Doctor",
    doctorDepartment: department,
  });
  if (isConflict.length === 0) {
    return next(new ErrorHandler("Doctor not found", 404));
  }

  if (isConflict.length > 1) {
    return next(
      new ErrorHandler(
        "Doctors Conflict! Please Contact Through Email Or Phone!",
        404
      )
    );
  }
  const doctorId = isConflict[0]._id;
  const patientId = req.user._id;
  const appointment = await Appointment.create({
    firstName,
    lastName,
    email,
    phone,
    nic,
    dob,
    gender,
    appointment_date,
    department,
    doctor: {
      firstName: doctor_firstName,
      lastName: doctor_lastName,
    },
    hasVisited,
    address,
    doctorId,
    patientId,
  });
  res.status(200).json({
    success: true,
    appointment,
    message: "Appointment Sent Successfully!",
  });
});

export const getAllAppointments = catchAsyncErrors(async (req, res, next) => {
  const appointments = await Appointment.find();
  res.status(200).json({
    success: true,
    appointments,
  });
});

export const updateAppointmentStatus = catchAsyncErrors(
  async (req, res, next) => {
    const { id } = req.params;
    let appointment = await Appointment.findById(id);

    if (!appointment) {
      return next(new ErrorHandler("Appointment not found!", 404));
    }

    // Save the updated status
    appointment = await Appointment.findByIdAndUpdate(
      id,
      { status: req.body.status },
      {
        new: true,
        runValidators: true,
        useFindAndModify: false,
      }
    );

    // Get patient details
    const patient = appointment;

    // Send email notification based on updated status
    if (req.body.status === "Accepted" || req.body.status === "Rejected") {
      const doctor = appointment.doctor;
      const subject =
        req.body.status === "Accepted"
          ? "Appointment Confirmed"
          : "Appointment Rejected";

      const message =
        req.body.status === "Accepted"
          ? `Hello ${patient.firstName} ${patient.lastName},\n\nYour appointment with Dr. ${doctor.firstName} ${doctor.lastName} on ${appointment.appointment_date} has been approved.\n\nThank you.`
          : `Hello ${patient.firstName} ${patient.lastName},\n\nWe're sorry, but your appointment with Dr. ${doctor.firstName} ${doctor.lastName} on ${appointment.appointment_date} has been rejected.\n\nPlease contact us for further assistance.`;

      const mailOptions = {
        from: process.env.EMAIL, // Your email address
        to: patient.email, // Email of the patient
        subject,
        text: message,
      };

      try {
        await transporter.sendMail(mailOptions); // Send the email
      } catch (emailError) {
        console.error("Failed to send email:", emailError); // Handle email sending error
      }
    }

    res.status(200).json({
      success: true,
      message: "Appointment Status Updated!",
      appointment,
    });
  }
);
export const deleteAppointment = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const appointment = await Appointment.findById(id);
  if (!appointment) {
    return next(new ErrorHandler("Appointment Not Found!", 404));
  }
  await appointment.deleteOne();
  res.status(200).json({
    success: true,
    message: "Appointment Deleted!",
  });
});
