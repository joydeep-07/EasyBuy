import Address from '../models/Address.js';
import User from '../models/User.js';

// @desc    Get all addresses for logged-in user
// @route   GET /api/addresses
export const getAddresses = async (req, res, next) => {
  try {
    const addresses = await Address.find({ user: req.user._id }).sort({ isDefault: -1, createdAt: -1 });
    res.status(200).json({
      success: true,
      count: addresses.length,
      addresses,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new address
// @route   POST /api/addresses
export const addAddress = async (req, res, next) => {
  try {
    const {
      fullName,
      phoneNumber,
      houseBuilding,
      street,
      locality,
      landmark,
      city,
      state,
      pincode,
      addressType,
      isDefault,
    } = req.body;

    const existingCount = await Address.countDocuments({ user: req.user._id });
    const shouldBeDefault = existingCount === 0 || !!isDefault;

    if (shouldBeDefault) {
      await Address.updateMany({ user: req.user._id }, { isDefault: false });
    }

    const address = await Address.create({
      user: req.user._id,
      fullName,
      phoneNumber,
      houseBuilding,
      street,
      locality,
      landmark,
      city,
      state,
      pincode,
      addressType: addressType || 'HOME',
      isDefault: shouldBeDefault,
    });

    if (shouldBeDefault) {
      await User.findByIdAndUpdate(req.user._id, { defaultAddress: address._id });
    }

    res.status(201).json({
      success: true,
      message: 'Address added successfully',
      address,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update address
// @route   PUT /api/addresses/:id
export const updateAddress = async (req, res, next) => {
  try {
    let address = await Address.findOne({ _id: req.params.id, user: req.user._id });
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    if (req.body.isDefault) {
      await Address.updateMany({ user: req.user._id }, { isDefault: false });
      await User.findByIdAndUpdate(req.user._id, { defaultAddress: address._id });
    }

    Object.assign(address, req.body);
    await address.save();

    res.status(200).json({
      success: true,
      message: 'Address updated successfully',
      address,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete address
// @route   DELETE /api/addresses/:id
export const deleteAddress = async (req, res, next) => {
  try {
    const address = await Address.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    // If deleted address was default, make another one default
    if (address.isDefault) {
      const nextAddress = await Address.findOne({ user: req.user._id }).sort({ createdAt: -1 });
      if (nextAddress) {
        nextAddress.isDefault = true;
        await nextAddress.save();
        await User.findByIdAndUpdate(req.user._id, { defaultAddress: nextAddress._id });
      } else {
        await User.findByIdAndUpdate(req.user._id, { defaultAddress: null });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Address removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Set address as default
// @route   PATCH /api/addresses/:id/default
export const setDefaultAddress = async (req, res, next) => {
  try {
    await Address.updateMany({ user: req.user._id }, { isDefault: false });
    const address = await Address.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isDefault: true },
      { new: true }
    );

    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    await User.findByIdAndUpdate(req.user._id, { defaultAddress: address._id });

    res.status(200).json({
      success: true,
      message: 'Default address updated',
      address,
    });
  } catch (error) {
    next(error);
  }
};
